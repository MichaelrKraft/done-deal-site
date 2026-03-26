/**
 * DocuSign eSignature API client.
 * Uses OAuth2 with authorization code grant + refresh token flow.
 * Follows the same pattern as microsoft-graph.ts.
 */

export interface DocuSignTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  account_id: string
  base_uri: string
}

interface SignerStatus {
  name: string
  email: string
  status: string
  signed_at: string | null
}

const SCOPES = 'signature'

function getConfig() {
  const clientId = process.env.DOCUSIGN_CLIENT_ID ?? ''
  const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET ?? ''
  const redirectUri = process.env.DOCUSIGN_REDIRECT_URI ?? ''
  const baseUrl = process.env.DOCUSIGN_BASE_URL ?? 'https://account-d.docusign.com'
  return { clientId, clientSecret, redirectUri, baseUrl }
}

function tokenUrl(): string {
  const { baseUrl } = getConfig()
  return `${baseUrl}/oauth/token`
}

/** Build the DocuSign OAuth2 authorization URL. */
export function getDocuSignAuthUrl(state: string): string {
  const { clientId, redirectUri, baseUrl } = getConfig()
  const params = new URLSearchParams({
    response_type: 'code',
    scope: SCOPES,
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  })
  return `${baseUrl}/oauth/auth?${params.toString()}`
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeDocuSignCode(code: string): Promise<DocuSignTokens | null> {
  const { clientId, clientSecret, redirectUri } = getConfig()
  if (!clientId || !clientSecret) return null

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(tokenUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) {
    console.error('[docusign] exchangeCode failed:', await res.text())
    return null
  }

  const data = await res.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  // Get the user's account info to find account_id and base_uri
  const userInfo = await fetchUserInfo(data.access_token)
  if (!userInfo) return null

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    account_id: userInfo.account_id,
    base_uri: userInfo.base_uri,
  }
}

/** Refresh an expired access token using the refresh token. */
export async function refreshDocuSignTokens(
  refreshToken: string,
  accountId: string,
  baseUri: string
): Promise<DocuSignTokens | null> {
  const { clientId, clientSecret } = getConfig()
  if (!clientId || !clientSecret) return null

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(tokenUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    console.error('[docusign] refreshTokens failed:', await res.text())
    return null
  }

  const data = await res.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    account_id: accountId,
    base_uri: baseUri,
  }
}

/** Fetch the authenticated user's account info from DocuSign. */
async function fetchUserInfo(
  accessToken: string
): Promise<{ account_id: string; base_uri: string } | null> {
  const { baseUrl } = getConfig()
  const res = await fetch(`${baseUrl}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    console.error('[docusign] fetchUserInfo failed:', await res.text())
    return null
  }

  const data = await res.json() as {
    accounts: Array<{
      account_id: string
      base_uri: string
      is_default: boolean
    }>
  }

  const defaultAccount = data.accounts.find((a) => a.is_default) ?? data.accounts[0]
  if (!defaultAccount) return null

  return {
    account_id: defaultAccount.account_id,
    base_uri: defaultAccount.base_uri,
  }
}

/** Send a document to one or more recipients for e-signature via DocuSign. */
export async function sendForSignature(params: {
  tokens: DocuSignTokens
  document: { fileName: string; base64Content: string; fileExtension: string }
  recipients: Array<{ name: string; email: string }>
  emailSubject: string
}): Promise<{ success: boolean; envelopeId?: string; error?: string; refreshedTokens?: DocuSignTokens }> {
  const { document: doc, recipients, emailSubject } = params
  let { tokens } = params

  // Refresh if token expires within 5 minutes
  if (Date.now() > tokens.expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshDocuSignTokens(
      tokens.refresh_token,
      tokens.account_id,
      tokens.base_uri
    )
    if (!refreshed) return { success: false, error: 'Token refresh failed' }
    tokens = refreshed
  }

  const url = `${tokens.base_uri}/restapi/v2.1/accounts/${tokens.account_id}/envelopes`

  const envelope = {
    emailSubject,
    documents: [
      {
        documentBase64: doc.base64Content,
        name: doc.fileName,
        fileExtension: doc.fileExtension,
        documentId: '1',
      },
    ],
    recipients: {
      signers: recipients.map((r, i) => ({
        email: r.email,
        name: r.name,
        recipientId: String(i + 1),
        routingOrder: String(i + 1),
      })),
    },
    status: 'sent',
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelope),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[docusign] sendForSignature failed:', text)
    return { success: false, error: `DocuSign API error: ${res.status}` }
  }

  const data = await res.json() as { envelopeId: string }
  return { success: true, envelopeId: data.envelopeId, refreshedTokens: tokens }
}

/** Get the status of a DocuSign envelope and its signers. */
export async function getEnvelopeStatus(
  tokens: DocuSignTokens,
  envelopeId: string
): Promise<{
  success: boolean
  status?: string
  signers?: SignerStatus[]
  error?: string
  refreshedTokens?: DocuSignTokens
}> {
  let accessToken = tokens.access_token

  // Refresh if token expires within 5 minutes
  if (Date.now() > tokens.expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshDocuSignTokens(
      tokens.refresh_token,
      tokens.account_id,
      tokens.base_uri
    )
    if (!refreshed) return { success: false, error: 'Token refresh failed' }
    accessToken = refreshed.access_token
    tokens = refreshed
  }

  const url = `${tokens.base_uri}/restapi/v2.1/accounts/${tokens.account_id}/envelopes/${envelopeId}/recipients`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[docusign] getEnvelopeStatus failed:', text)
    return { success: false, error: `DocuSign API error: ${res.status}` }
  }

  const data = await res.json() as {
    signers: Array<{
      name: string
      email: string
      status: string
      signedDateTime: string | null
    }>
  }

  const signers: SignerStatus[] = (data.signers ?? []).map((s) => ({
    name: s.name,
    email: s.email,
    status: s.status,
    signed_at: s.signedDateTime ?? null,
  }))

  // Determine overall envelope status from signers
  const allSigned = signers.length > 0 && signers.every((s) => s.status === 'completed')
  const anyDeclined = signers.some((s) => s.status === 'declined')
  const overallStatus = anyDeclined ? 'declined' : allSigned ? 'signed' : 'sent'

  return {
    success: true,
    status: overallStatus,
    signers,
    refreshedTokens: tokens,
  }
}

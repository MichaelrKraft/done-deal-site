/**
 * Microsoft Graph API client for sending emails via Outlook.
 * Uses OAuth2 with refresh token flow.
 */

export interface OutlookTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

interface EmailPayload {
  to: string
  subject: string
  body: string
}

const GRAPH_SEND_URL = 'https://graph.microsoft.com/v1.0/me/sendMail'
const SCOPES = 'Mail.Send Mail.ReadWrite offline_access'

function getConfig() {
  const clientId = process.env.MICROSOFT_CLIENT_ID ?? ''
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET ?? ''
  const tenantId = process.env.MICROSOFT_TENANT_ID ?? 'common'
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI ?? ''
  return { clientId, clientSecret, tenantId, redirectUri }
}

function tokenUrl(tenantId: string): string {
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
}

/** Build the Microsoft OAuth2 authorization URL. */
export function getAuthUrl(state: string): string {
  const { clientId, tenantId, redirectUri } = getConfig()
  const base = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
    response_mode: 'query',
    prompt: 'consent',
  })
  return `${base}?${params.toString()}`
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCode(code: string): Promise<OutlookTokens | null> {
  const { clientId, clientSecret, tenantId, redirectUri } = getConfig()
  if (!clientId || !clientSecret) return null

  const res = await fetch(tokenUrl(tenantId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: SCOPES,
    }),
  })

  if (!res.ok) {
    console.error('[microsoft-graph] exchangeCode failed:', await res.text())
    return null
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

/** Refresh an expired access token using the refresh token. */
export async function refreshTokens(refreshToken: string): Promise<OutlookTokens | null> {
  const { clientId, clientSecret, tenantId } = getConfig()
  if (!clientId || !clientSecret) return null

  const res = await fetch(tokenUrl(tenantId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }),
  })

  if (!res.ok) {
    console.error('[microsoft-graph] refreshTokens failed:', await res.text())
    return null
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

/** Send an email via Microsoft Graph. Auto-refreshes tokens if expired. */
export async function sendEmail(
  tokens: OutlookTokens,
  email: EmailPayload
): Promise<{ success: boolean; error?: string; refreshedTokens?: OutlookTokens }> {
  let accessToken = tokens.access_token

  // Refresh if token expires within 5 minutes
  if (Date.now() > tokens.expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshTokens(tokens.refresh_token)
    if (!refreshed) return { success: false, error: 'Token refresh failed' }
    accessToken = refreshed.access_token
    tokens = refreshed
  }

  const res = await fetch(GRAPH_SEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject: email.subject,
        body: { contentType: 'HTML', content: email.body },
        toRecipients: [{ emailAddress: { address: email.to } }],
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[microsoft-graph] sendEmail failed:', text)
    return { success: false, error: `Graph API error: ${res.status}` }
  }

  return { success: true, refreshedTokens: tokens }
}

/**
 * Google Workspace API client for sending emails via Gmail
 * and creating events via Google Calendar.
 * Uses OAuth2 with refresh token flow.
 */

export interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  email: string
}

interface EmailPayload {
  to: string
  subject: string
  body: string
}

interface CalendarEvent {
  subject: string
  date: string // YYYY-MM-DD
  description?: string
}

const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
const CALENDAR_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
const SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email'

function getConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? ''
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? ''
  return { clientId, clientSecret, redirectUri }
}

/** Build the Google OAuth2 authorization URL. */
export function getGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = getConfig()
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
    access_type: 'offline',
    prompt: 'consent',
  })
  return `${AUTH_URL}?${params.toString()}`
}

/** Exchange an authorization code for access + refresh tokens, then fetch user email. */
export async function exchangeGoogleCode(code: string): Promise<GoogleTokens | null> {
  const { clientId, clientSecret, redirectUri } = getConfig()
  if (!clientId || !clientSecret) return null

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    console.error('[google-workspace] exchangeGoogleCode failed:', await res.text())
    return null
  }

  const data = await res.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  // Fetch user email from userinfo endpoint
  const userRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  })

  let email = ''
  if (userRes.ok) {
    const userInfo = await userRes.json() as { email: string }
    email = userInfo.email
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    email,
  }
}

/** Refresh an expired access token using the refresh token. */
export async function refreshGoogleTokens(refreshToken: string): Promise<GoogleTokens | null> {
  const { clientId, clientSecret } = getConfig()
  if (!clientId || !clientSecret) return null

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    console.error('[google-workspace] refreshGoogleTokens failed:', await res.text())
    return null
  }

  // Google refresh responses may not include a new refresh_token
  const data = await res.json() as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
    email: '', // preserved by caller
  }
}

/**
 * Build a base64url-encoded RFC 2822 email message for the Gmail API.
 */
function buildRawEmail(to: string, subject: string, body: string): string {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    body,
  ].join('\r\n')

  // base64url encode (no padding, URL-safe characters)
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Send an email via Gmail API. Auto-refreshes tokens if expired. */
export async function sendGmailEmail(
  tokens: GoogleTokens,
  email: EmailPayload
): Promise<{ success: boolean; error?: string; refreshedTokens?: GoogleTokens }> {
  let currentTokens = { ...tokens }

  // Refresh if token expires within 5 minutes
  if (Date.now() > currentTokens.expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshGoogleTokens(currentTokens.refresh_token)
    if (!refreshed) return { success: false, error: 'Token refresh failed' }
    refreshed.email = currentTokens.email // preserve email
    currentTokens = refreshed
  }

  const raw = buildRawEmail(email.to, email.subject, email.body)

  const res = await fetch(GMAIL_SEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentTokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[google-workspace] sendGmailEmail failed:', text)
    return { success: false, error: `Gmail API error: ${res.status}` }
  }

  return {
    success: true,
    refreshedTokens: currentTokens !== tokens ? currentTokens : undefined,
  }
}

/** Create a calendar event in the agent's Google Calendar. */
export async function createGoogleCalendarEvent(
  tokens: GoogleTokens,
  event: CalendarEvent
): Promise<{ success: boolean; error?: string; refreshedTokens?: GoogleTokens }> {
  let currentTokens = { ...tokens }

  if (Date.now() > currentTokens.expires_at - 5 * 60 * 1000) {
    const refreshed = await refreshGoogleTokens(currentTokens.refresh_token)
    if (!refreshed) return { success: false, error: 'Token refresh failed' }
    refreshed.email = currentTokens.email
    currentTokens = refreshed
  }

  // All-day event uses `date` (not `dateTime`)
  const body = {
    summary: event.subject,
    description: event.description ?? '',
    start: { date: event.date, timeZone: 'America/Denver' },
    end: { date: event.date, timeZone: 'America/Denver' },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup' as const, minutes: 1440 }],
    },
  }

  const res = await fetch(CALENDAR_EVENTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentTokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[google-workspace] createGoogleCalendarEvent failed:', text)
    return { success: false, error: `Calendar API error: ${res.status}` }
  }

  return {
    success: true,
    refreshedTokens: currentTokens !== tokens ? currentTokens : undefined,
  }
}

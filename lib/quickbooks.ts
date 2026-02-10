const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID!
const QB_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET!
const QB_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI!
const QB_AUTH_BASE = 'https://appcenter.intuit.com/connect/oauth2'
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

export async function getAuthorizationUrl(): Promise<string> {
  const params = new URLSearchParams({
    client_id: QB_CLIENT_ID,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: QB_REDIRECT_URI,
    state: crypto.randomUUID(),
  })

  return `${QB_AUTH_BASE}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string) {
  const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: QB_REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${errorText}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

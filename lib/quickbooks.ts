import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface QBAuthToken {
  access_token: string
  refresh_token: string
  token_expires_at: number
  realm_id: string
}

export async function getAuthorizationUrl(): Promise<string> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI
  const scope = encodeURIComponent('com.intuit.quickbooks.accounting openid profile email')
  const state = Math.random().toString(36).substring(7)
  
  return `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`
}

export async function exchangeCodeForToken(code: string): Promise<QBAuthToken> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI

  // Create Basic Auth header
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri!,
    }).toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to exchange code for token: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_expires_at: Date.now() + data.expires_in * 1000,
    realm_id: '', // Will be set from the request
  }
}

export async function getQBTransactions(userId: string, realmId: string) {
  const { data: connection } = await supabase
    .from('quickbooks_connections')
    .select('access_token')
    .eq('user_id', userId)
    .eq('realm_id', realmId)
    .single()

  if (!connection?.access_token) {
    throw new Error('QuickBooks connection not found or token expired')
  }

  const query = "select * from Transaction startPosition 1 maxResults 100"
  const encodedQuery = encodeURIComponent(query)

  const response = await fetch(
    `https://quickbooks.api.intuit.com/v2/company/${realmId}/query?query=${encodedQuery}`,
    {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Accept': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getQBInvoices(userId: string, realmId: string) {
  const { data: connection } = await supabase
    .from('quickbooks_connections')
    .select('access_token')
    .eq('user_id', userId)
    .eq('realm_id', realmId)
    .single()

  if (!connection?.access_token) {
    throw new Error('QuickBooks connection not found')
  }

  const query = "select * from Invoice startPosition 1 maxResults 100"
  const encodedQuery = encodeURIComponent(query)

  const response = await fetch(
    `https://quickbooks.api.intuit.com/v2/company/${realmId}/query?query=${encodedQuery}`,
    {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Accept': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getQBBills(userId: string, realmId: string) {
  const { data: connection } = await supabase
    .from('quickbooks_connections')
    .select('access_token')
    .eq('user_id', userId)
    .eq('realm_id', realmId)
    .single()

  if (!connection?.access_token) {
    throw new Error('QuickBooks connection not found')
  }

  const query = "select * from Bill startPosition 1 maxResults 100"
  const encodedQuery = encodeURIComponent(query)

  const response = await fetch(
    `https://quickbooks.api.intuit.com/v2/company/${realmId}/query?query=${encodedQuery}`,
    {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Accept': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.statusText}`)
  }

  return response.json()
}

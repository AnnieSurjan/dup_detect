import { exchangeCodeForToken } from '@/lib/quickbooks'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  console.log('[v0] QB Callback called')
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  console.log('[v0] Code:', code ? 'present' : 'missing')
  console.log('[v0] RealmId:', realmId)

  if (!code || !realmId) {
    console.log('[v0] Missing code or realmId')
    return NextResponse.json(
      { error: 'Missing authorization code or realm ID' },
      { status: 400 }
    )
  }

  try {
    console.log('[v0] Exchanging code for token...')
    const token = await exchangeCodeForToken(code)
    console.log('[v0] Token received successfully')
    
    // Fetch company info from QuickBooks (use sandbox URL for development)
    let companyName = 'QuickBooks Company'
    try {
      const apiBaseUrl = 'https://sandbox-quickbooks.api.intuit.com'
      const companyInfoResponse = await fetch(
        `${apiBaseUrl}/v3/company/${realmId}/companyinfo/${realmId}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Accept': 'application/json',
          },
        }
      )
      
      if (companyInfoResponse.ok) {
        const companyInfo = await companyInfoResponse.json()
        companyName = companyInfo.CompanyInfo?.CompanyName || companyName
        console.log('[v0] Company name:', companyName)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch company info:', error)
    }
    
    // Create connection data to pass to frontend (including token for sync)
    const connectionData = {
      company_id: realmId,
      company_name: companyName,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_expires_at: token.token_expires_at,
      last_sync_at: new Date().toISOString(),
    }

    console.log('[v0] Connection successful, redirecting...')
    // Redirect back to dashboard with connection data
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dup-detect.onrender.com'
    return NextResponse.redirect(
      `${baseUrl}/dashboard?qb_connected=true&qb_data=${encodeURIComponent(JSON.stringify(connectionData))}`
    )
  } catch (error) {
    console.error('[v0] QB Callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dup-detect.onrender.com'
    return NextResponse.redirect(
      `${baseUrl}/dashboard?qb_error=${encodeURIComponent(error instanceof Error ? error.message : 'Connection failed')}`
    )
  }
}

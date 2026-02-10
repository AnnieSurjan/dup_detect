import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-1'

    const { data, error } = await supabase
      .from('quickbooks_connections')
      .select('*')
      .eq('user_id', userId)
      .order('is_active', { ascending: false })
      .order('connected_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ companies: data || [] })
  } catch (error) {
    console.error('[v0] Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId = 'user-1',
      companyId,
      companyName,
      realmId,
      accessToken,
      refreshToken
    } = body

    // Create new QuickBooks connection
    const { data, error } = await supabase
      .from('quickbooks_connections')
      .insert({
        user_id: userId,
        company_id: companyId,
        company_name: companyName,
        realm_id: realmId,
        access_token: accessToken,
        refresh_token: refreshToken,
        is_active: false,
        connected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'info',
        title: 'Company Connected',
        message: `${companyName} has been connected to Dup-Detect`,
        is_read: false,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ company: data })
  } catch (error) {
    console.error('[v0] Error creating company connection:', error)
    return NextResponse.json({ error: 'Failed to create company connection' }, { status: 500 })
  }
}

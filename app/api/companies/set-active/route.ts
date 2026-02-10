import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'user-1', companyId } = body

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    // First, deactivate all companies for this user
    await supabase
      .from('quickbooks_connections')
      .update({ is_active: false })
      .eq('user_id', userId)

    // Then activate the selected company
    const { data, error } = await supabase
      .from('quickbooks_connections')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ company: data })
  } catch (error) {
    console.error('[v0] Error setting active company:', error)
    return NextResponse.json({ error: 'Failed to set active company' }, { status: 500 })
  }
}

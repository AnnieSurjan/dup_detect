import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const settingKey = searchParams.get('setting_key')

    let query = supabase
      .from('settings_audit')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (settingKey) {
      query = query.eq('setting_key', settingKey)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('[Audit] Settings audit fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch settings audit' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Audit] Settings endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface SettingsAuditRequest {
  setting_key: string
  old_value?: any
  new_value: any
  reason?: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SettingsAuditRequest = await req.json()

    if (!body.setting_key || body.new_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: setting_key, new_value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('settings_audit')
      .insert({
        user_id: user.id,
        modified_by: user.id,
        setting_key: body.setting_key,
        old_value: body.old_value,
        new_value: body.new_value,
        reason: body.reason,
      })
      .select()
      .single()

    if (error) {
      console.error('[Audit] Settings audit creation error:', error)
      return NextResponse.json({ error: 'Failed to create settings audit' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[Audit] Settings POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

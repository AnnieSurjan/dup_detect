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
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    let query = supabase
      .from('export_history')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('[Audit] Export history fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch export history' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Audit] Export endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface ExportRequest {
  export_type: 'csv' | 'pdf' | 'excel'
  scope: 'all_time' | 'date_range' | 'scan_id'
  filter_params?: Record<string, any>
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ExportRequest = await req.json()

    if (!body.export_type || !body.scope) {
      return NextResponse.json(
        { error: 'Missing required fields: export_type, scope' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('export_history')
      .insert({
        user_id: user.id,
        export_type: body.export_type,
        scope: body.scope,
        filter_params: body.filter_params,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[Audit] Export creation error:', error)
      return NextResponse.json({ error: 'Failed to create export' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[Audit] Export POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

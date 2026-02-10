import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface AuditLogRequest {
  action: string
  resource_type: string
  resource_id?: string
  description: string
  changes?: Record<string, any>
  status?: 'pending' | 'completed' | 'failed'
  error_message?: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AuditLogRequest = await req.json()

    // Validate required fields
    if (!body.action || !body.resource_type || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: action, resource_type, description' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const user_agent = req.headers.get('user-agent') || undefined

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: body.action,
        resource_type: body.resource_type,
        resource_id: body.resource_id,
        description: body.description,
        changes: body.changes,
        ip_address,
        user_agent,
        status: body.status || 'completed',
        error_message: body.error_message,
      })
      .select()
      .single()

    if (error) {
      console.error('[Audit] Log creation error:', error)
      return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[Audit] Log endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-1' // Default user for now
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Ensure table exists
    await ensureNotificationsTable()

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ 
      notifications: data || [],
      unreadCount: data?.filter(n => !n.is_read).length || 0
    })
  } catch (error) {
    console.error('[v0] Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'user-1', type, title, message, metadata } = body

    // Ensure table exists
    await ensureNotificationsTable()

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata: metadata || {},
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification: data })
  } catch (error) {
    console.error('[v0] Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

async function ensureNotificationsTable() {
  try {
    // Try to create table if it doesn't exist
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT,
          metadata JSONB DEFAULT '{}'::jsonb,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          read_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      `
    })
    
    // If the rpc doesn't exist, that's okay - table might already exist
    if (error && !error.message.includes('does not exist')) {
      console.error('[v0] Error ensuring notifications table:', error)
    }
  } catch (error) {
    // Ignore errors - table might already exist or we don't have permissions
    console.log('[v0] Could not create notifications table via RPC, assuming it exists')
  }
}

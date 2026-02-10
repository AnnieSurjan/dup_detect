import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the last action for the current user
    const { data, error } = await supabase
      .from('user_last_action')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[Undo] Last action fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch last action' }, { status: 500 })
    }

    return NextResponse.json({ data: data || null })
  } catch (error) {
    console.error('[Undo] Last action endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

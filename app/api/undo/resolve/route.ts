import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface UndoResolveRequest {
  duplicate_id: string
  reason?: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UndoResolveRequest = await req.json()

    if (!body.duplicate_id) {
      return NextResponse.json(
        { error: 'Missing required field: duplicate_id' },
        { status: 400 }
      )
    }

    // Get the duplicate transaction
    const { data: duplicate, error: dupError } = await supabase
      .from('duplicate_transactions')
      .select('*')
      .eq('id', body.duplicate_id)
      .eq('user_id', user.id)
      .single()

    if (dupError || !duplicate) {
      return NextResponse.json({ error: 'Duplicate not found' }, { status: 404 })
    }

    if (duplicate.status !== 'resolved') {
      return NextResponse.json(
        { error: 'Can only undo resolved duplicates' },
        { status: 400 }
      )
    }

    // Create undo history record
    const { data: undoRecord, error: undoError } = await supabase
      .from('undo_history')
      .insert({
        user_id: user.id,
        duplicate_id: body.duplicate_id,
        original_transaction_id: duplicate.transaction_id_1,
        duplicate_transaction_id: duplicate.transaction_id_2,
        action_type: 'duplicate_resolution_undo',
        reason: body.reason,
        undone_by: user.id,
      })
      .select()
      .single()

    if (undoError) {
      console.error('[Undo] Undo record creation error:', undoError)
      return NextResponse.json({ error: 'Failed to create undo record' }, { status: 500 })
    }

    // Update duplicate status back to pending
    const { error: updateError } = await supabase
      .from('duplicate_transactions')
      .update({ status: 'pending', reviewed_by: null, reviewed_at: null })
      .eq('id', body.duplicate_id)

    if (updateError) {
      console.error('[Undo] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to undo resolution' }, { status: 500 })
    }

    // Update last action
    await supabase
      .from('user_last_action')
      .upsert({
        user_id: user.id,
        last_action_type: 'duplicate_resolution_undo',
        last_action_id: body.duplicate_id,
        can_undo: false,
        last_action_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Log the undo action in audit logs
    await supabase
      .from('activity_history')
      .insert({
        user_id: user.id,
        action_type: 'duplicate_resolution_undo',
        actor_id: user.id,
        actor_name: user.user_metadata?.name || user.email,
        target_id: body.duplicate_id,
        target_type: 'duplicate_transaction',
        summary: `Undone duplicate resolution for transaction pair`,
        details: {
          original_transaction: duplicate.transaction_id_1,
          duplicate_transaction: duplicate.transaction_id_2,
          reason: body.reason,
        },
      })

    return NextResponse.json({ data: undoRecord }, { status: 200 })
  } catch (error) {
    console.error('[Undo] Resolve endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

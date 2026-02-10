import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface BatchUndoRequest {
  duplicate_ids: string[]
  reason?: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BatchUndoRequest = await req.json()

    if (!body.duplicate_ids || body.duplicate_ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: duplicate_ids' },
        { status: 400 }
      )
    }

    // Create batch queue record
    const { data: batchRecord, error: batchError } = await supabase
      .from('undo_batch_queue')
      .insert({
        user_id: user.id,
        duplicate_ids: body.duplicate_ids,
        total_items: body.duplicate_ids.length,
        status: 'processing',
        reason: body.reason,
      })
      .select()
      .single()

    if (batchError) {
      console.error('[Undo] Batch creation error:', batchError)
      return NextResponse.json({ error: 'Failed to create batch undo' }, { status: 500 })
    }

    // Process each duplicate
    const undoResults = []
    let successCount = 0
    let failureCount = 0

    for (const duplicateId of body.duplicate_ids) {
      try {
        // Get the duplicate transaction
        const { data: duplicate } = await supabase
          .from('duplicate_transactions')
          .select('*')
          .eq('id', duplicateId)
          .eq('user_id', user.id)
          .single()

        if (!duplicate || duplicate.status !== 'resolved') {
          failureCount++
          continue
        }

        // Create undo history record
        const { data: undoRecord } = await supabase
          .from('undo_history')
          .insert({
            user_id: user.id,
            duplicate_id: duplicateId,
            original_transaction_id: duplicate.transaction_id_1,
            duplicate_transaction_id: duplicate.transaction_id_2,
            action_type: 'duplicate_resolution_undo',
            reason: body.reason,
            undone_by: user.id,
            batch_id: batchRecord.id,
          })
          .select()
          .single()

        // Update duplicate status back to pending
        await supabase
          .from('duplicate_transactions')
          .update({ status: 'pending', reviewed_by: null, reviewed_at: null })
          .eq('id', duplicateId)

        undoResults.push({
          duplicate_id: duplicateId,
          status: 'success',
          undo_record: undoRecord,
        })

        successCount++
      } catch (error) {
        console.error(`[Undo] Batch error for ${duplicateId}:`, error)
        failureCount++
        undoResults.push({
          duplicate_id: duplicateId,
          status: 'failed',
          error: 'Failed to undo',
        })
      }
    }

    // Update batch record with results
    await supabase
      .from('undo_batch_queue')
      .update({
        status: 'completed',
        processed_items: successCount,
        failed_items: failureCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', batchRecord.id)

    return NextResponse.json({
      data: {
        batch_id: batchRecord.id,
        total: body.duplicate_ids.length,
        success_count: successCount,
        failure_count: failureCount,
        results: undoResults,
      },
    })
  } catch (error) {
    console.error('[Undo] Batch endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

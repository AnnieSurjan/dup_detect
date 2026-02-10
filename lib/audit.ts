/**
 * Audit logging helper for tracking user actions
 */

import { createClient } from '@/lib/supabase/server'

export interface AuditAction {
  action: string
  resource_type: 'duplicate_transaction' | 'scan_history' | 'settings' | 'export' | 'schedule' | 'connection' | 'user_profile' | 'other'
  resource_id?: string
  description: string
  changes?: Record<string, any>
  status?: 'pending' | 'completed' | 'failed'
  error_message?: string
}

export async function logAction(action: AuditAction): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn('[Audit] Cannot log action - user not authenticated')
      return
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: action.action,
      resource_type: action.resource_type,
      resource_id: action.resource_id,
      description: action.description,
      changes: action.changes,
      status: action.status || 'completed',
      error_message: action.error_message,
    })
  } catch (error) {
    console.error('[Audit] Failed to log action:', error)
  }
}

export async function logActivityHistory(
  actorId: string,
  actorName: string,
  actionType: string,
  summary: string,
  targetId?: string,
  targetType?: string,
  details?: Record<string, any>,
  isEnterpriseFeature: boolean = false
): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn('[Audit] Cannot log activity - user not authenticated')
      return
    }

    await supabase.from('activity_history').insert({
      user_id: user.id,
      action_type: actionType,
      actor_id: actorId,
      actor_name: actorName,
      target_id: targetId,
      target_type: targetType,
      summary,
      details,
      enterprise_feature: isEnterpriseFeature,
    })
  } catch (error) {
    console.error('[Audit] Failed to log activity:', error)
  }
}

export async function logSettingsChange(
  settingKey: string,
  oldValue: any,
  newValue: any,
  reason?: string
): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn('[Audit] Cannot log settings change - user not authenticated')
      return
    }

    await supabase.from('settings_audit').insert({
      user_id: user.id,
      modified_by: user.id,
      setting_key: settingKey,
      old_value: oldValue,
      new_value: newValue,
      reason,
    })
  } catch (error) {
    console.error('[Audit] Failed to log settings change:', error)
  }
}

/**
 * Log duplicate transaction resolution
 */
export async function logDuplicateResolution(
  duplicateId: string,
  action: 'resolved' | 'dismissed' | 'deleted',
  reason?: string
): Promise<void> {
  const actionMap = {
    resolved: 'Duplicate transaction resolved',
    dismissed: 'Duplicate transaction dismissed',
    deleted: 'Duplicate transaction deleted',
  }

  const { data: { user } } = await createClient().then(c => c.auth.getUser())

  await logActivityHistory(
    user?.id || '',
    user?.user_metadata?.full_name || user?.email || 'Unknown',
    `duplicate_${action}`,
    actionMap[action],
    duplicateId,
    'duplicate_transaction',
    { reason },
    false
  )
}

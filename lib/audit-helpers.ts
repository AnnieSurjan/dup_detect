import { createClient } from '@/lib/supabase/server'

export async function logSettingChange(
  userId: string,
  settingKey: string,
  oldValue: any,
  newValue: any,
  modifiedBy: string,
  reason?: string
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('settings_audit').insert({
      user_id: userId,
      setting_key: settingKey,
      old_value: oldValue,
      new_value: newValue,
      modified_by: modifiedBy,
      reason: reason || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[v0] Error logging setting change:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[v0] Failed to log setting change:', err)
    return false
  }
}

export async function logActivityAction(
  userId: string,
  actionType: string,
  actorId: string,
  actorName: string,
  summary: string,
  details?: any,
  enterpriseFeature: boolean = false
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('activity_history').insert({
      user_id: userId,
      action_type: actionType,
      actor_id: actorId,
      actor_name: actorName,
      summary,
      details: details || null,
      enterprise_feature: enterpriseFeature,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[v0] Error logging activity:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[v0] Failed to log activity:', err)
    return false
  }
}

export async function logExportAction(
  userId: string,
  exportType: 'csv' | 'pdf' | 'excel',
  scope: string,
  filterParams?: any,
  rowCount: number = 0
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('export_history').insert({
      user_id: userId,
      export_type: exportType,
      scope,
      filter_params: filterParams || null,
      row_count: rowCount,
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[v0] Error logging export:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[v0] Failed to log export:', err)
    return false
  }
}

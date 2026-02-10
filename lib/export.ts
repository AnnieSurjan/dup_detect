import { createClient } from '@/lib/supabase/server'

interface ExportOptions {
  type: 'csv' | 'pdf' | 'excel'
  scope: 'all_time' | 'date_range' | 'scan_id'
  startDate?: string
  endDate?: string
  scanId?: string
}

export async function generateActivityExport(
  userId: string,
  options: ExportOptions
): Promise<string> {
  const supabase = await createClient()

  let query = supabase
    .from('audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options.scope === 'date_range' && options.startDate && options.endDate) {
    query = query
      .gte('created_at', options.startDate)
      .lte('created_at', options.endDate)
  } else if (options.scope === 'scan_id' && options.scanId) {
    query = query.eq('scan_id', options.scanId)
  }

  const { data: activities, error } = await query

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`)
  }

  const rows = activities || []

  // Generate CSV format
  const headers = ['Date', 'Action', 'Details', 'Status']
  const csvRows = rows.map((row: Record<string, unknown>) =>
    [
      row.created_at,
      row.action,
      row.details || '',
      row.status || '',
    ]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(',')
  )

  return [headers.join(','), ...csvRows].join('\n')
}

export async function logExportHistory(
  userId: string,
  type: string,
  scope: string,
  rowCount: number
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('export_history').insert({
    user_id: userId,
    export_type: type,
    scope,
    row_count: rowCount,
    created_at: new Date().toISOString(),
  })
}

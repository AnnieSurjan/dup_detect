import { createClient } from '@/lib/supabase/server'
import { generateActivityExport, logExportHistory } from '@/lib/export'
import { NextResponse } from 'next/server'

interface ExportRequest {
  type: 'csv' | 'pdf' | 'excel'
  scope: 'all_time' | 'date_range' | 'scan_id'
  startDate?: string
  endDate?: string
  scanId?: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ExportRequest = await req.json()

    if (!body.type || !body.scope) {
      return NextResponse.json(
        { error: 'Missing required fields: type, scope' },
        { status: 400 }
      )
    }

    // Generate export data
    const content = await generateActivityExport(user.id, {
      type: body.type,
      scope: body.scope,
      startDate: body.startDate,
      endDate: body.endDate,
      scanId: body.scanId,
    })

    // Determine file extension and content type
    let contentType = 'text/plain'
    let fileName = `activity-export-${new Date().toISOString().split('T')[0]}`

    switch (body.type) {
      case 'csv':
        contentType = 'text/csv'
        fileName += '.csv'
        break
      case 'excel':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileName += '.xlsx'
        break
      case 'pdf':
        contentType = 'application/pdf'
        fileName += '.pdf'
        break
    }

    // Log export to database
    const rowCount = content.split('\n').length - 1
    await logExportHistory(user.id, body.type, body.scope, rowCount)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('[Audit] Export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}

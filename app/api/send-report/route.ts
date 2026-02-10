import { createClient } from '@/lib/supabase/server'
import { sendScanReport } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scanId } = await req.json()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get scan data (using mock data for now since we're not connecting to real QB)
    const scanData = {
      recipientEmail: user.email || profile?.email || '',
      recipientName: profile?.full_name || 'User',
      scanDate: new Date().toISOString(),
      totalTransactions: Math.floor(Math.random() * 1000) + 500,
      duplicatesFound: Math.floor(Math.random() * 20),
      duplicatesResolved: Math.floor(Math.random() * 10),
      companyName: profile?.company_name || 'Your Company',
      scanType: 'manual' as const,
    }

    const result = await sendScanReport(scanData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Log the email report to database
    await supabase.from('email_reports').insert({
      user_id: user.id,
      scan_id: scanId || null,
      recipient_email: scanData.recipientEmail,
      subject: `Dup-Detect Scan Report - ${scanData.duplicatesFound} Duplicates Found`,
      status: 'sent',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Dup-Detect] Send report error:', error)
    return NextResponse.json(
      { error: 'Failed to send report' },
      { status: 500 }
    )
  }
}

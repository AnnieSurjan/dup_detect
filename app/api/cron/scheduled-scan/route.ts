import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Verify this is a cron request from Vercel
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('[v0] Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentHour = now.getUTCHours()
    const currentDay = now.getUTCDay()
    const currentDate = now.getUTCDate()

    console.log('[v0] Running scheduled scan check', { currentHour, currentDay, currentDate })

    // Get all active schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('scan_schedules')
      .select('*')
      .eq('is_active', true)

    if (schedulesError) {
      console.error('[v0] Error fetching schedules:', schedulesError)
      throw schedulesError
    }

    if (!schedules || schedules.length === 0) {
      console.log('[v0] No active schedules found')
      return NextResponse.json({ message: 'No active schedules', scansTriggered: 0 })
    }

    let scansTriggered = 0

    // Check each schedule to see if it should run now
    for (const schedule of schedules) {
      const shouldRun = checkIfShouldRun(schedule, now)
      
      if (shouldRun) {
        console.log('[v0] Triggering scan for schedule:', schedule.id)
        
        // Trigger the scan
        await triggerScan(schedule)
        
        // Update last_run_at and next_run_at
        await supabase
          .from('scan_schedules')
          .update({
            last_run_at: now.toISOString(),
            next_run_at: calculateNextRun(schedule, now).toISOString()
          })
          .eq('id', schedule.id)

        scansTriggered++
      }
    }

    console.log('[v0] Scheduled scan check complete', { scansTriggered })

    return NextResponse.json({ 
      message: 'Scheduled scan check complete',
      scansTriggered,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error('[v0] Error in scheduled scan cron:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function checkIfShouldRun(schedule: any, now: Date): boolean {
  const [scheduleHour, scheduleMinute] = schedule.time_of_day.split(':').map(Number)
  const currentHour = now.getUTCHours()
  
  // Check if it's the right hour (cron runs every hour)
  if (currentHour !== scheduleHour) {
    return false
  }

  // Check frequency-specific conditions
  if (schedule.frequency === 'daily') {
    return true
  } else if (schedule.frequency === 'weekly') {
    return now.getUTCDay() === schedule.day_of_week
  } else if (schedule.frequency === 'monthly') {
    return now.getUTCDate() === schedule.day_of_month
  }

  return false
}

function calculateNextRun(schedule: any, from: Date): Date {
  const [hour, minute] = schedule.time_of_day.split(':').map(Number)
  const next = new Date(from)
  
  if (schedule.frequency === 'daily') {
    next.setUTCDate(next.getUTCDate() + 1)
  } else if (schedule.frequency === 'weekly') {
    next.setUTCDate(next.getUTCDate() + 7)
  } else if (schedule.frequency === 'monthly') {
    next.setUTCMonth(next.getUTCMonth() + 1)
  }
  
  next.setUTCHours(hour, minute, 0, 0)
  return next
}

async function triggerScan(schedule: any) {
  try {
    // Create a new scan history record
    const { data: scan, error: scanError } = await supabase
      .from('scan_history')
      .insert({
        user_id: schedule.user_id,
        quickbooks_connection_id: schedule.quickbooks_connection_id,
        scan_type: 'scheduled',
        status: 'running',
        total_transactions: 0,
        duplicates_found: 0,
        duplicates_resolved: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (scanError) {
      console.error('[v0] Error creating scan record:', scanError)
      throw scanError
    }

    console.log('[v0] Scan record created:', scan.id)

    // Simulate scanning (in real app, this would call QuickBooks API)
    // For now, we'll just create some mock duplicates
    const mockDuplicates = generateMockDuplicates(scan.id, schedule.user_id)
    
    // Insert mock duplicates
    if (mockDuplicates.length > 0) {
      const { error: dupError } = await supabase
        .from('duplicate_transactions')
        .insert(mockDuplicates)

      if (dupError) {
        console.error('[v0] Error inserting duplicates:', dupError)
      }
    }

    // Update scan as completed
    await supabase
      .from('scan_history')
      .update({
        status: 'completed',
        total_transactions: 100,
        duplicates_found: mockDuplicates.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', scan.id)

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: schedule.user_id,
        type: 'scan_complete',
        title: 'Scheduled Scan Complete',
        message: `Found ${mockDuplicates.length} potential duplicates in your QuickBooks data.`,
        metadata: {
          scan_id: scan.id,
          duplicates_count: mockDuplicates.length
        },
        is_read: false,
        created_at: new Date().toISOString()
      })

    console.log('[v0] Scan completed successfully')
  } catch (error) {
    console.error('[v0] Error triggering scan:', error)
    throw error
  }
}

function generateMockDuplicates(scanId: string, userId: string) {
  // Generate 2-5 mock duplicate pairs
  const count = Math.floor(Math.random() * 4) + 2
  const duplicates = []

  for (let i = 0; i < count; i++) {
    const amount = (Math.random() * 1000 + 100).toFixed(2)
    const vendors = ['Acme Corp', 'Tech Supplies Inc', 'Office Depot', 'Amazon Business', 'Staples']
    const vendor = vendors[Math.floor(Math.random() * vendors.length)]
    
    duplicates.push({
      scan_id: scanId,
      user_id: userId,
      original_transaction_id: `QBO-${Date.now()}-${i}-A`,
      duplicate_transaction_id: `QBO-${Date.now()}-${i}-B`,
      transaction_type: 'Expense',
      amount: parseFloat(amount),
      transaction_date: new Date().toISOString(),
      vendor_name: vendor,
      description: `Payment to ${vendor}`,
      confidence_score: Math.random() * 0.3 + 0.7,
      status: 'pending',
      created_at: new Date().toISOString()
    })
  }

  return duplicates
}

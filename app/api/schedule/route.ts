import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-1'

    const { data, error } = await supabase
      .from('scan_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ schedules: data || [] })
  } catch (error) {
    console.error('[v0] Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId = 'user-1',
      frequency,
      dayOfWeek,
      dayOfMonth,
      timeOfDay,
      timezone,
      isActive,
      emailNotifications
    } = body

    // Calculate next run time
    const nextRunAt = calculateNextRun(frequency, dayOfWeek, dayOfMonth, timeOfDay, timezone)

    const { data, error } = await supabase
      .from('scan_schedules')
      .insert({
        user_id: userId,
        frequency,
        day_of_week: dayOfWeek,
        day_of_month: dayOfMonth,
        time_of_day: timeOfDay,
        timezone,
        is_active: isActive,
        next_run_at: nextRunAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'info',
        title: 'Schedule Created',
        message: `Automated scans will run ${frequency} at ${timeOfDay}`,
        is_read: false,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ schedule: data })
  } catch (error) {
    console.error('[v0] Error creating schedule:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const {
      scheduleId,
      userId = 'user-1',
      frequency,
      dayOfWeek,
      dayOfMonth,
      timeOfDay,
      timezone,
      isActive,
      emailNotifications
    } = body

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    // Calculate next run time
    const nextRunAt = calculateNextRun(frequency, dayOfWeek, dayOfMonth, timeOfDay, timezone)

    const { data, error } = await supabase
      .from('scan_schedules')
      .update({
        frequency,
        day_of_week: dayOfWeek,
        day_of_month: dayOfMonth,
        time_of_day: timeOfDay,
        timezone,
        is_active: isActive,
        next_run_at: nextRunAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ schedule: data })
  } catch (error) {
    console.error('[v0] Error updating schedule:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('scheduleId')
    const userId = searchParams.get('userId') || 'user-1'

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('scan_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting schedule:', error)
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
}

function calculateNextRun(
  frequency: string,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  timeOfDay: string,
  timezone: string
): Date {
  const now = new Date()
  const [hour, minute] = timeOfDay.split(':').map(Number)
  const next = new Date(now)

  // Set the time
  next.setUTCHours(hour, minute, 0, 0)

  // If the time has already passed today, move to next occurrence
  if (next <= now) {
    if (frequency === 'daily') {
      next.setUTCDate(next.getUTCDate() + 1)
    } else if (frequency === 'weekly' && dayOfWeek !== null) {
      // Move to next occurrence of the day of week
      const currentDay = next.getUTCDay()
      const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7
      next.setUTCDate(next.getUTCDate() + daysUntilTarget)
    } else if (frequency === 'monthly' && dayOfMonth !== null) {
      // Move to next month
      next.setUTCMonth(next.getUTCMonth() + 1)
      next.setUTCDate(dayOfMonth)
    }
  }

  return next
}

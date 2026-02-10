"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, Bell, Save, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Schedule {
  id: string
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number
  dayOfMonth?: number
  timeOfDay: string
  timezone: string
  isActive: boolean
  emailNotifications: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
]

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule>({
    id: '',
    frequency: 'weekly',
    dayOfWeek: 1,
    timeOfDay: '09:00',
    timezone: 'America/New_York',
    isActive: true,
    emailNotifications: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch existing schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/schedule?userId=user-1')
        const data = await response.json()
        
        if (data.schedules && data.schedules.length > 0) {
          const existingSchedule = data.schedules[0]
          setSchedule({
            id: existingSchedule.id,
            frequency: existingSchedule.frequency,
            dayOfWeek: existingSchedule.day_of_week,
            dayOfMonth: existingSchedule.day_of_month,
            timeOfDay: existingSchedule.time_of_day,
            timezone: existingSchedule.timezone,
            isActive: existingSchedule.is_active,
            emailNotifications: true,
          })
        }
      } catch (error) {
        console.error('[v0] Error fetching schedule:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const endpoint = schedule.id ? '/api/schedule' : '/api/schedule'
      const method = schedule.id ? 'PATCH' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: schedule.id || undefined,
          userId: 'user-1',
          frequency: schedule.frequency,
          dayOfWeek: schedule.dayOfWeek,
          dayOfMonth: schedule.dayOfMonth,
          timeOfDay: schedule.timeOfDay,
          timezone: schedule.timezone,
          isActive: schedule.isActive,
          emailNotifications: schedule.emailNotifications,
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSchedule(prev => ({ ...prev, id: data.schedule.id }))
        toast({
          title: "Schedule saved",
          description: "Your scan schedule has been updated successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('[v0] Error saving schedule:', error)
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!schedule.id) return
    
    try {
      const response = await fetch(`/api/schedule?scheduleId=${schedule.id}&userId=user-1`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSchedule({
          id: '',
          frequency: 'weekly',
          dayOfWeek: 1,
          timeOfDay: '09:00',
          timezone: 'America/New_York',
          isActive: false,
          emailNotifications: true,
        })
        toast({
          title: "Schedule deleted",
          description: "Your scan schedule has been removed.",
        })
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('[v0] Error deleting schedule:', error)
      toast({
        title: "Error",
        description: "Failed to delete schedule. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading schedule...</p>
      </div>
    )
  }

  const getNextRunDescription = () => {
    const now = new Date()
    const [hours, minutes] = schedule.timeOfDay.split(':').map(Number)
    
    if (schedule.frequency === 'daily') {
      return `Every day at ${schedule.timeOfDay}`
    } else if (schedule.frequency === 'weekly') {
      const day = DAYS_OF_WEEK.find(d => d.value === schedule.dayOfWeek)?.label
      return `Every ${day} at ${schedule.timeOfDay}`
    } else {
      return `On day ${schedule.dayOfMonth} of each month at ${schedule.timeOfDay}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scan Schedule</h1>
        <p className="text-muted-foreground">
          Configure automated duplicate detection scans
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schedule Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Configuration
            </CardTitle>
            <CardDescription>
              Set up when automatic scans should run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Schedule */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="schedule-active">Enable Scheduled Scans</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically scan for duplicates on a schedule
                </p>
              </div>
              <Switch
                id="schedule-active"
                checked={schedule.isActive}
                onCheckedChange={(checked) => setSchedule({ ...schedule, isActive: checked })}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={schedule.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                  setSchedule({ ...schedule, frequency: value })
                }
                disabled={!schedule.isActive}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day Selection */}
            {schedule.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={schedule.dayOfWeek?.toString()}
                  onValueChange={(value) =>
                    setSchedule({ ...schedule, dayOfWeek: parseInt(value) })
                  }
                  disabled={!schedule.isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {schedule.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Select
                  value={schedule.dayOfMonth?.toString() || '1'}
                  onValueChange={(value) =>
                    setSchedule({ ...schedule, dayOfMonth: parseInt(value) })
                  }
                  disabled={!schedule.isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={schedule.timeOfDay}
                    onChange={(e) => setSchedule({ ...schedule, timeOfDay: e.target.value })}
                    className="pl-9"
                    disabled={!schedule.isActive}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={schedule.timezone}
                  onValueChange={(value) => setSchedule({ ...schedule, timezone: value })}
                  disabled={!schedule.isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive a report after each scheduled scan
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={schedule.emailNotifications}
                onCheckedChange={(checked) =>
                  setSchedule({ ...schedule, emailNotifications: checked })
                }
                disabled={!schedule.isActive}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Schedule'}
              </Button>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Next Scan</p>
              {schedule.isActive ? (
                <p className="mt-1 text-lg font-semibold text-primary">
                  {getNextRunDescription()}
                </p>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  Scheduled scans are disabled
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={schedule.isActive ? 'text-success font-medium' : 'text-muted-foreground'}>
                  {schedule.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="capitalize">{schedule.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>{schedule.timeOfDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timezone</span>
                <span>
                  {TIMEZONES.find(tz => tz.value === schedule.timezone)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Reports</span>
                <span>{schedule.emailNotifications ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

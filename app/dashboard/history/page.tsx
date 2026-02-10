"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Download, Eye } from "lucide-react"
import { getMockScanHistory } from "@/lib/mock-data"
import type { ScanHistory } from "@/lib/types"
import Link from "next/link"

interface ActivityItem {
  id: string
  action_type: string
  actor_name: string
  summary: string
  created_at: string
  enterprise_feature: boolean
}

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanHistory[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    // Load mock scan history for backward compatibility
    setScans(getMockScanHistory())
    
    // Fetch real activity history from API
    fetchActivityHistory()
  }, [])

  const fetchActivityHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/audit/activity?limit=50')
      if (!response.ok) {
        console.error('Failed to fetch activity history')
        return
      }
      const result = await response.json()
      setActivities(result.data || [])
    } catch (error) {
      console.error('[v0] Activity history fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (exportType: 'csv' | 'excel') => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: exportType,
          scope: 'all_time',
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `history-export-${new Date().toISOString().split('T')[0]}.${exportType === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[v0] Export error:', error)
      alert('Failed to export history')
    } finally {
      setIsExporting(false)
    }
  }

  const filteredScans = filter === "all" 
    ? scans 
    : scans.filter(s => s.status === filter)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'In progress...'
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diff = endDate.getTime() - startDate.getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />
      case 'running':
        return <RefreshCw className="h-5 w-5 text-primary animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'running':
        return <Badge variant="secondary">Running</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const stats = {
    total: scans.length,
    completed: scans.filter(s => s.status === 'completed').length,
    failed: scans.filter(s => s.status === 'failed').length,
    totalDuplicates: scans.reduce((sum, s) => sum + s.duplicatesFound, 0),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scan History</h1>
          <p className="text-muted-foreground">
            View past scans and their results
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            disabled={isExporting}
            onClick={() => handleExport('csv')}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button 
            variant="outline" 
            disabled={isExporting}
            onClick={() => handleExport('excel')}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.totalDuplicates}</div>
            <p className="text-sm text-muted-foreground">Duplicates Found</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Scan History
            </CardTitle>
            <CardDescription>
              {filteredScans.length} scan{filteredScans.length !== 1 ? 's' : ''} found
            </CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scans</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">No scans found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Run a scan to see it appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    {getStatusIcon(scan.status)}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {scan.scanType === 'manual' ? 'Manual Scan' : 'Scheduled Scan'}
                        </span>
                        {getStatusBadge(scan.status)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(scan.startedAt)}
                        </span>
                        <span>
                          Duration: {formatDuration(scan.startedAt, scan.completedAt)}
                        </span>
                      </div>
                      {scan.status === 'failed' && scan.errorMessage && (
                        <p className="text-sm text-destructive">{scan.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {scan.status === 'completed' && (
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-semibold">{scan.totalTransactions}</div>
                          <div className="text-muted-foreground">Scanned</div>
                        </div>
                        <div>
                          <div className="font-semibold text-warning">{scan.duplicatesFound}</div>
                          <div className="text-muted-foreground">Found</div>
                        </div>
                        <div>
                          <div className="font-semibold text-success">{scan.duplicatesResolved}</div>
                          <div className="text-muted-foreground">Resolved</div>
                        </div>
                      </div>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/history/${scan.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity History
          </CardTitle>
          <CardDescription>
            Timeline of all actions and changes in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading activity...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">No activity yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your activity history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 pt-1">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{activity.summary}</span>
                      {activity.enterprise_feature && (
                        <Badge variant="secondary" className="text-xs">Enterprise</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>by {activity.actor_name || 'System'}</span>
                      <span>{formatDate(activity.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

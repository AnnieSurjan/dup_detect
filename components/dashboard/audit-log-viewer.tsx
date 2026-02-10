'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AuditLog {
  id: string
  action: string
  resource_type: string
  description: string
  user_id: string
  status: string
  created_at: string
}

interface AuditLogViewerProps {
  userId?: string
  resourceType?: string
}

export function AuditLogViewer({ userId, resourceType }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    fetchAuditLogs()
  }, [userId, resourceType, filterAction])

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filterAction !== 'all') params.append('action', filterAction)
      if (resourceType) params.append('resourceType', resourceType)
      
      const response = await fetch(`/api/audit/log?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')
      
      const result = await response.json()
      setLogs(result.data || [])
    } catch (error) {
      console.error('[v0] Audit log fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>Complete record of actions and changes</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAuditLogs()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="duplicate_resolved">Duplicate Resolved</SelectItem>
              <SelectItem value="settings_updated">Settings Updated</SelectItem>
              <SelectItem value="export_generated">Export Generated</SelectItem>
              <SelectItem value="scan_completed">Scan Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between rounded-lg border p-3 text-sm hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{log.action}</div>
                  <p className="text-xs text-muted-foreground mt-1">{log.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <Badge variant="outline">{log.resource_type}</Badge>
                    <span className="text-muted-foreground">{formatDate(log.created_at)}</span>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(log.status)}>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ScanHistory } from '@/lib/types'
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

interface RecentActivityProps {
  scans: ScanHistory[]
}

export function RecentActivity({ scans }: RecentActivityProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'running':
        return <Clock className="h-4 w-4 text-primary animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'running':
        return <Badge variant="default">Running</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest scan results</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/history">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scans yet. Start your first scan to detect duplicates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.slice(0, 5).map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(scan.status)}
                  <div>
                    <p className="font-medium text-sm">
                      {scan.scan_type === 'manual' ? 'Manual Scan' : 'Scheduled Scan'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(scan.started_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {scan.duplicates_found} duplicates
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scan.total_transactions.toLocaleString()} transactions
                    </p>
                  </div>
                  {getStatusBadge(scan.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

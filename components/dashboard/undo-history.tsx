'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Clock } from 'lucide-react'

interface UndoRecord {
  id: string
  action_type: string
  original_transaction_id: string
  duplicate_transaction_id: string
  reason?: string
  created_at: string
}

interface UndoHistoryProps {
  limit?: number
}

export function UndoHistory({ limit = 10 }: UndoHistoryProps) {
  const [history, setHistory] = useState<UndoRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUndoHistory()
  }, [])

  const fetchUndoHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/undo/history?limit=${limit}`)
      if (!response.ok) {
        console.error('Failed to fetch undo history')
        return
      }
      const result = await response.json()
      setHistory(result.data || [])
    } catch (error) {
      console.error('[v0] Undo history fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Undo History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Undo History
          </CardTitle>
          <CardDescription>No undo actions yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Undo History
        </CardTitle>
        <CardDescription>
          Recent duplicate resolution undos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <RotateCcw className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Duplicate Resolution Undone</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Transaction {record.original_transaction_id.slice(0, 8)}... paired with {record.duplicate_transaction_id.slice(0, 8)}...
                </p>
                {record.reason && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Reason: {record.reason}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(record.created_at).toLocaleDateString()} {new Date(record.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

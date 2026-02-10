'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link2, Link2Off, RefreshCw, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { QuickbooksConnection } from '@/lib/types'

interface QuickBooksConnectionProps {
  initialConnection?: QuickbooksConnection | null
}

export function QuickBooksConnection({ initialConnection }: QuickBooksConnectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [connection, setConnection] = useState<QuickbooksConnection | null>(initialConnection || null)
  const [isLoading, setIsLoading] = useState(false)

  // Check URL params for new connection and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const qbData = params.get('qb_data')
      const qbConnected = params.get('qb_connected')
      
      if (qbConnected === 'true' && qbData) {
        try {
          const connectionData = JSON.parse(decodeURIComponent(qbData))
          localStorage.setItem('qb_connection', JSON.stringify(connectionData))
          setConnection(connectionData)
          toast({
            title: 'Success',
            description: 'QuickBooks connected successfully!',
          })
          // Clean URL
          window.history.replaceState({}, '', '/dashboard')
        } catch (error) {
          console.error('Failed to parse QB connection data:', error)
        }
      } else if (!connection) {
        const stored = localStorage.getItem('qb_connection')
        if (stored) {
          setConnection(JSON.parse(stored))
        }
      }
    }
  }, [connection, toast])

  async function handleConnect() {
    setIsLoading(true)
    try {
      // Redirect to OAuth authorization
      window.location.href = '/api/quickbooks/authorize'
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start QuickBooks connection',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  async function handleDisconnect() {
    setIsLoading(true)
    try {
      // Clear connection
      localStorage.removeItem('qb_connection')
      setConnection(null)
      toast({
        title: 'Success',
        description: 'QuickBooks disconnected',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSync() {
    if (!connection) return
    
    setIsLoading(true)
    try {
      console.log('[v0] Connection data:', connection)
      console.log('[v0] Access token:', (connection as any).access_token ? 'present' : 'missing')
      console.log('[v0] Company ID:', connection.company_id)
      
      const response = await fetch('/api/quickbooks/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: (connection as any).access_token,
          company_id: connection.company_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync data')
      }

      const data = await response.json()
      
      // Update last sync time
      const updatedConnection = {
        ...connection,
        last_sync_at: new Date().toISOString(),
      }
      localStorage.setItem('qb_connection', JSON.stringify(updatedConnection))
      setConnection(updatedConnection)

      toast({
        title: 'Success',
        description: `Synced ${data.data.transactions.length} transactions, ${data.data.invoices.length} invoices, ${data.data.bills.length} bills`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              QuickBooks Connection
            </CardTitle>
            <CardDescription>
              Connect your QuickBooks Online account to start scanning
            </CardDescription>
          </div>
          <Badge variant={connection ? 'default' : 'secondary'}>
            {connection ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {connection ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{connection.company_name || 'Connected Company'}</p>
                <p className="text-sm text-muted-foreground">
                  ID: {connection.company_id}
                </p>
                {connection.last_sync_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last synced: {new Date(connection.last_sync_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  <Link2Off className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Connect your QuickBooks account to detect duplicate transactions
            </p>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect QuickBooks'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

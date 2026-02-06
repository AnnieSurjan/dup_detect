"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { QuickBooksConnection } from "@/components/dashboard/quickbooks-connection"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DuplicatesPreview } from "@/components/dashboard/duplicates-preview"
import { Button } from "@/components/ui/button"
import { Play, Calendar } from "lucide-react"
import { getMockDashboardStats, getMockDuplicates, getMockScanHistory } from "@/lib/mock-data"
import type { DashboardStats, DuplicateTransaction, ScanHistory } from "@/lib/types"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [duplicates, setDuplicates] = useState<DuplicateTransaction[]>([])
  const [recentScans, setRecentScans] = useState<ScanHistory[]>([])
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Load mock data
    setStats(getMockDashboardStats())
    setDuplicates(getMockDuplicates().filter(d => d.status === 'pending').slice(0, 5))
    setRecentScans(getMockScanHistory().slice(0, 5))
  }, [])

  const handleStartScan = async () => {
    setIsScanning(true)
    // Simulate scan
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsScanning(false)
    // Refresh data
    setStats(getMockDashboardStats())
    setDuplicates(getMockDuplicates().filter(d => d.status === 'pending').slice(0, 5))
    setRecentScans(getMockScanHistory().slice(0, 5))
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your QuickBooks transactions and manage duplicates
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/dashboard/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Scan
            </a>
          </Button>
          <Button onClick={handleStartScan} disabled={isScanning}>
            <Play className="mr-2 h-4 w-4" />
            {isScanning ? "Scanning..." : "Run Scan Now"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards
        totalScans={stats.totalScans}
        duplicatesFound={stats.duplicatesFound}
        duplicatesResolved={stats.duplicatesResolved}
        moneySaved={stats.moneySaved}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* QuickBooks Connection */}
        <QuickBooksConnection />
        
        {/* Recent Activity */}
        <RecentActivity scans={recentScans} />
      </div>

      {/* Pending Duplicates Preview */}
      <DuplicatesPreview duplicates={duplicates} />
    </div>
  )
}

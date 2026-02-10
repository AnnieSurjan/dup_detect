"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, TrendingUp, Clock, Zap, BarChart3, PieChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PerformanceMetrics {
  avgScanTime: number
  avgTransactionsPerSec: number
  totalScansThisMonth: number
  duplicateDetectionRate: number
  scanSuccessRate: number
  peakPerformanceTime: string
  recentScans: Array<{
    date: string
    duration: number
    transactions: number
    duplicates: number
    tps: number
  }>
  monthlyTrend: Array<{
    month: string
    scans: number
    duplicates: number
    avgTime: number
  }>
}

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/insights?userId=user-1')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('[v0] Error fetching metrics:', error)
      // Use mock data if API fails
      setMetrics(getMockMetrics())
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading insights...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No performance data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Performance Insights</h1>
        <p className="text-muted-foreground">
          Track scanning performance and optimize your duplicate detection workflow
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scan Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgScanTime}s</div>
            <p className="text-xs text-muted-foreground">
              Per 1,000 transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgTransactionsPerSec}</div>
            <p className="text-xs text-muted-foreground">
              Transactions per second
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.duplicateDetectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Duplicates found
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.scanSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              Scans completed successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Scans</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Scan Performance
              </CardTitle>
              <CardDescription>
                Detailed metrics from your last 10 scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentScans.map((scan, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {new Date(scan.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.transactions} transactions
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{scan.duration}s</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{scan.tps} TPS</p>
                        <p className="text-xs text-muted-foreground">Throughput</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={scan.duplicates > 0 ? "default" : "secondary"}>
                          {scan.duplicates} duplicates
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Performance Trends
              </CardTitle>
              <CardDescription>
                Track how your scanning efficiency evolves over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.monthlyTrend.map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{month.month}</p>
                      <p className="text-xs text-muted-foreground">
                        {month.scans} total scans
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{month.duplicates}</p>
                        <p className="text-xs text-muted-foreground">Duplicates Found</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{month.avgTime}s</p>
                        <p className="text-xs text-muted-foreground">Avg Time</p>
                      </div>
                      <div className="w-24">
                        {index > 0 && (
                          <Badge
                            variant={
                              month.avgTime < metrics.monthlyTrend[index - 1].avgTime
                                ? "default"
                                : "secondary"
                            }
                          >
                            {month.avgTime < metrics.monthlyTrend[index - 1].avgTime ? '↓' : '↑'}
                            {Math.abs(
                              ((month.avgTime - metrics.monthlyTrend[index - 1].avgTime) /
                                metrics.monthlyTrend[index - 1].avgTime) *
                                100
                            ).toFixed(0)}
                            %
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>
                Tips to improve your duplicate detection performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Peak Performance Time</p>
                      <p className="text-sm text-muted-foreground">
                        Your scans run fastest around <strong>{metrics.peakPerformanceTime}</strong>.
                        Consider scheduling automatic scans during this time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Scheduled Scans</p>
                      <p className="text-sm text-muted-foreground">
                        Running scans on a regular schedule helps catch duplicates early,
                        reducing the amount of data to process each time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-600/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Data Quality</p>
                      <p className="text-sm text-muted-foreground">
                        Maintaining consistent vendor names and transaction descriptions
                        improves duplicate detection accuracy and speed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/10 flex items-center justify-center flex-shrink-0">
                      <PieChart className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Batch Processing</p>
                      <p className="text-sm text-muted-foreground">
                        For large datasets, consider breaking scans into smaller date ranges
                        to maintain optimal performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getMockMetrics(): PerformanceMetrics {
  return {
    avgScanTime: 2.4,
    avgTransactionsPerSec: 450,
    totalScansThisMonth: 28,
    duplicateDetectionRate: 3.2,
    scanSuccessRate: 99.6,
    peakPerformanceTime: '2:00 AM - 4:00 AM',
    recentScans: [
      { date: new Date().toISOString(), duration: 2.1, transactions: 1200, duplicates: 5, tps: 571 },
      { date: new Date(Date.now() - 86400000).toISOString(), duration: 2.8, transactions: 980, duplicates: 3, tps: 350 },
      { date: new Date(Date.now() - 172800000).toISOString(), duration: 1.9, transactions: 1450, duplicates: 8, tps: 763 },
      { date: new Date(Date.now() - 259200000).toISOString(), duration: 3.2, transactions: 890, duplicates: 2, tps: 278 },
      { date: new Date(Date.now() - 345600000).toISOString(), duration: 2.5, transactions: 1100, duplicates: 4, tps: 440 },
    ],
    monthlyTrend: [
      { month: 'January 2026', scans: 31, duplicates: 124, avgTime: 2.8 },
      { month: 'December 2025', scans: 28, duplicates: 98, avgTime: 3.1 },
      { month: 'November 2025', scans: 30, duplicates: 156, avgTime: 3.4 },
      { month: 'October 2025', scans: 29, duplicates: 87, avgTime: 3.6 },
    ],
  }
}

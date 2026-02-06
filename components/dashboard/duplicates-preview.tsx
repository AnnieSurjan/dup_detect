"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, AlertTriangle, Check, X } from "lucide-react"
import type { DuplicateTransaction } from "@/lib/types"
import Link from "next/link"

interface DuplicatesPreviewProps {
  duplicates: DuplicateTransaction[]
}

export function DuplicatesPreview({ duplicates }: DuplicatesPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getConfidenceBadge = (score: number) => {
    if (score >= 95) {
      return <Badge variant="destructive">High Match {score}%</Badge>
    } else if (score >= 80) {
      return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground border-warning/30">Likely Match {score}%</Badge>
    }
    return <Badge variant="outline">Possible Match {score}%</Badge>
  }

  if (duplicates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-success" />
            No Pending Duplicates
          </CardTitle>
          <CardDescription>
            Your QuickBooks data is clean! Run a scan to check for new duplicates.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Pending Duplicates
          </CardTitle>
          <CardDescription>
            {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} found that need your attention
          </CardDescription>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/duplicates">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {duplicates.map((duplicate) => (
            <div
              key={duplicate.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{duplicate.vendorName}</span>
                  {getConfidenceBadge(duplicate.confidenceScore)}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{duplicate.transactionType}</span>
                  <span>{formatDate(duplicate.transactionDate)}</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(duplicate.amount)}
                  </span>
                </div>
                {duplicate.description && (
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {duplicate.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <X className="mr-1 h-3 w-3" />
                  Delete
                </Button>
                <Button variant="outline" size="sm">
                  <Check className="mr-1 h-3 w-3" />
                  Keep Both
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

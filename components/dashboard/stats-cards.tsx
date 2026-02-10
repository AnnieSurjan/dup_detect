'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

interface StatsCardsProps {
  totalScans: number
  duplicatesFound: number
  duplicatesResolved: number
  moneySaved: number
}

export function StatsCards({
  totalScans,
  duplicatesFound,
  duplicatesResolved,
  moneySaved,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Scans',
      value: totalScans.toLocaleString(),
      description: 'All time scans performed',
      icon: Search,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    {
      title: 'Duplicates Found',
      value: duplicatesFound.toLocaleString(),
      description: 'Total duplicates detected',
      icon: AlertTriangle,
      iconColor: 'text-warning-foreground',
      iconBg: 'bg-warning/20',
    },
    {
      title: 'Resolved',
      value: duplicatesResolved.toLocaleString(),
      description: `${duplicatesFound > 0 ? Math.round((duplicatesResolved / duplicatesFound) * 100) : 0}% resolution rate`,
      icon: CheckCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
    },
    {
      title: 'Money Saved',
      value: `$${moneySaved.toLocaleString()}`,
      description: 'From resolved duplicates',
      icon: DollarSign,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

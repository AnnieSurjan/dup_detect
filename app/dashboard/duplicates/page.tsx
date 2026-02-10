"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Check, X, Search, Filter, Trash2 } from "lucide-react"
import { getMockDuplicates } from "@/lib/mock-data"
import type { DuplicateTransaction } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { AdvancedFilters, type AdvancedFilters as AdvancedFiltersType } from "@/components/dashboard/advanced-filters"
import { isWithinInterval, parseISO } from "date-fns"

export default function DuplicatesPage() {
  const [duplicates, setDuplicates] = useState<DuplicateTransaction[]>([])
  const [filteredDuplicates, setFilteredDuplicates] = useState<DuplicateTransaction[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>({
    dateRange: { preset: 'all' },
    amountRange: {},
    vendors: [],
    groups: []
  })

  useEffect(() => {
    setDuplicates(getMockDuplicates())
  }, [])

  useEffect(() => {
    let filtered = duplicates

    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(d => d.transactionType === typeFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(d =>
        d.vendorName?.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        d.amount.toString().includes(term)
      )
    }

    // Advanced Filters: Date Range
    if (advancedFilters.dateRange.preset !== 'all') {
      const now = new Date()
      let startDate: Date | null = null
      
      switch (advancedFilters.dateRange.preset) {
        case 'last7':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'last30':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'last90':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'custom':
          if (advancedFilters.dateRange.startDate && advancedFilters.dateRange.endDate) {
            filtered = filtered.filter(d => {
              const transactionDate = parseISO(d.transactionDate)
              return isWithinInterval(transactionDate, {
                start: advancedFilters.dateRange.startDate!,
                end: advancedFilters.dateRange.endDate!
              })
            })
          }
          break
      }
      
      if (startDate) {
        filtered = filtered.filter(d => {
          const transactionDate = parseISO(d.transactionDate)
          return transactionDate >= startDate
        })
      }
    }

    // Advanced Filters: Amount Range
    if (advancedFilters.amountRange.min !== undefined) {
      filtered = filtered.filter(d => d.amount >= advancedFilters.amountRange.min!)
    }
    if (advancedFilters.amountRange.max !== undefined) {
      filtered = filtered.filter(d => d.amount <= advancedFilters.amountRange.max!)
    }

    // Advanced Filters: Vendors
    if (advancedFilters.vendors.length > 0) {
      filtered = filtered.filter(d => 
        advancedFilters.vendors.includes(d.vendorName)
      )
    }

    // Advanced Filters: Groups
    if (advancedFilters.groups.length > 0) {
      filtered = filtered.filter(d => 
        advancedFilters.groups.includes(d.groupId)
      )
    }

    setFilteredDuplicates(filtered)
  }, [duplicates, statusFilter, typeFilter, searchTerm, advancedFilters])

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
      return <Badge variant="destructive">High {score}%</Badge>
    } else if (score >= 80) {
      return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">Medium {score}%</Badge>
    }
    return <Badge variant="outline">Low {score}%</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'kept':
        return <Badge className="bg-success text-success-foreground">Kept</Badge>
      case 'deleted':
        return <Badge variant="destructive">Deleted</Badge>
      case 'ignored':
        return <Badge variant="outline">Ignored</Badge>
      default:
        return null
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredDuplicates.filter(d => d.status === 'pending').map(d => d.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleAction = (action: 'delete' | 'keep' | 'ignore', ids?: string[]) => {
    const targetIds = ids || Array.from(selectedIds)
    setDuplicates(prev => prev.map(d => {
      if (targetIds.includes(d.id)) {
        return {
          ...d,
          status: action === 'delete' ? 'deleted' : action === 'keep' ? 'kept' : 'ignored',
          resolvedAt: new Date().toISOString(),
        }
      }
      return d
    }))
    setSelectedIds(new Set())
    toast({
      title: "Action completed",
      description: `${targetIds.length} transaction(s) marked as ${action === 'delete' ? 'deleted' : action === 'keep' ? 'kept' : 'ignored'}`,
    })
  }

  const pendingCount = filteredDuplicates.filter(d => d.status === 'pending').length

  // Get unique vendors and groups for filter options
  const availableVendors = useMemo(() => {
    const vendors = new Set(duplicates.map(d => d.vendorName))
    return Array.from(vendors).sort()
  }, [duplicates])

  const availableGroups = useMemo(() => {
    const groups = new Set(duplicates.map(d => d.groupId))
    return Array.from(groups).sort()
  }, [duplicates])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Duplicate Transactions</h1>
        <p className="text-muted-foreground">
          Review and manage detected duplicate transactions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor, description, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="kept">Kept</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="Bill">Bill</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                    <SelectItem value="Payment">Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Advanced Filters */}
            <AdvancedFilters
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              availableVendors={availableVendors}
              availableGroups={availableGroups}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm font-medium">
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleAction('ignore')}>
                Ignore
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAction('keep')}>
                <Check className="mr-1 h-3 w-3" />
                Keep Both
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleAction('delete')}>
                <Trash2 className="mr-1 h-3 w-3" />
                Delete Duplicates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicates List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                {filteredDuplicates.length} Duplicate{filteredDuplicates.length !== 1 ? 's' : ''} Found
              </CardTitle>
              <CardDescription>
                {pendingCount} pending review
              </CardDescription>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.size === pendingCount && pendingCount > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select all pending</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredDuplicates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="h-12 w-12 text-success mb-4" />
              <h3 className="font-medium">No duplicates found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter !== 'all' ? 'Try changing your filters' : 'Your data is clean!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDuplicates.map((duplicate) => (
                <div
                  key={duplicate.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"
                >
                  {duplicate.status === 'pending' && (
                    <Checkbox
                      checked={selectedIds.has(duplicate.id)}
                      onCheckedChange={(checked) => handleSelect(duplicate.id, !!checked)}
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{duplicate.vendorName}</span>
                      {getConfidenceBadge(duplicate.confidenceScore)}
                      {getStatusBadge(duplicate.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="outline" className="font-normal">
                          {duplicate.transactionType}
                        </Badge>
                      </span>
                      <span>{formatDate(duplicate.transactionDate)}</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(duplicate.amount)}
                      </span>
                    </div>
                    {duplicate.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {duplicate.description}
                      </p>
                    )}
                  </div>
                  {duplicate.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction('ignore', [duplicate.id])}
                      >
                        Ignore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('keep', [duplicate.id])}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Keep
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction('delete', [duplicate.id])}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

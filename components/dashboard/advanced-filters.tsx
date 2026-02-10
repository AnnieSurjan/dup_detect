"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, DollarSign, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

export interface AdvancedFilters {
  dateRange: DateRange | undefined
  minAmount: number | undefined
  maxAmount: number | undefined
  vendor: string
  quickDateRange: string
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters
  onChange: (filters: AdvancedFilters) => void
  vendors: string[]
}

export function AdvancedFilters({ filters, onChange, vendors }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = [
    filters.dateRange?.from && filters.dateRange?.to,
    filters.minAmount !== undefined,
    filters.maxAmount !== undefined,
    filters.vendor !== "all",
    filters.quickDateRange !== "all",
  ].filter(Boolean).length

  const handleQuickDateRange = (value: string) => {
    const now = new Date()
    let dateRange: DateRange | undefined

    switch (value) {
      case "7days":
        dateRange = {
          from: new Date(now.setDate(now.getDate() - 7)),
          to: new Date(),
        }
        break
      case "30days":
        dateRange = {
          from: new Date(now.setDate(now.getDate() - 30)),
          to: new Date(),
        }
        break
      case "90days":
        dateRange = {
          from: new Date(now.setDate(now.getDate() - 90)),
          to: new Date(),
        }
        break
      case "all":
      default:
        dateRange = undefined
        break
    }

    onChange({
      ...filters,
      quickDateRange: value,
      dateRange,
    })
  }

  const handleClearFilters = () => {
    onChange({
      dateRange: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      vendor: "all",
      quickDateRange: "all",
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px]" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Advanced Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-auto p-0 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Quick Date Range */}
            <div className="space-y-2">
              <Label>Quick Date Range</Label>
              <Select value={filters.quickDateRange} onValueChange={handleQuickDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-2">
              <Label>Custom Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={(range) =>
                      onChange({
                        ...filters,
                        dateRange: range,
                        quickDateRange: "all",
                      })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {filters.dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange({ ...filters, dateRange: undefined, quickDateRange: "all" })
                  }
                  className="w-full"
                >
                  Clear date range
                </Button>
              )}
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Amount Range</Label>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="minAmount" className="text-xs text-muted-foreground">
                    Min
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="0"
                      value={filters.minAmount ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="maxAmount" className="text-xs text-muted-foreground">
                    Max
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="maxAmount"
                      type="number"
                      placeholder="∞"
                      value={filters.maxAmount ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Filter */}
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select
                value={filters.vendor}
                onValueChange={(value) => onChange({ ...filters, vendor: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsOpen(false)} className="w-full">
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.quickDateRange !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.quickDateRange === "7days"
                ? "Last 7 Days"
                : filters.quickDateRange === "30days"
                ? "Last 30 Days"
                : "Last 90 Days"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleQuickDateRange("all")}
              />
            </Badge>
          )}
          {filters.dateRange?.from && filters.dateRange?.to && (
            <Badge variant="secondary" className="gap-1">
              {format(filters.dateRange.from, "MMM d")} -{" "}
              {format(filters.dateRange.to, "MMM d")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onChange({ ...filters, dateRange: undefined, quickDateRange: "all" })
                }
              />
            </Badge>
          )}
          {filters.minAmount !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Min: ${filters.minAmount}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, minAmount: undefined })}
              />
            </Badge>
          )}
          {filters.maxAmount !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Max: ${filters.maxAmount}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, maxAmount: undefined })}
              />
            </Badge>
          )}
          {filters.vendor !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.vendor}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, vendor: "all" })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

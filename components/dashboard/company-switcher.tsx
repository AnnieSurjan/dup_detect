"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface Company {
  id: string
  company_id: string
  company_name: string
  is_active: boolean
  last_sync_at: string | null
}

interface CompanySwitcherProps {
  onCompanyChange?: (companyId: string) => void
}

export function CompanySwitcher({ onCompanyChange }: CompanySwitcherProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/companies?userId=user-1')
      const data = await response.json()
      
      if (data.companies) {
        setCompanies(data.companies)
        
        // Set the active company or the first one
        const active = data.companies.find((c: Company) => c.is_active)
        setSelectedCompany(active || data.companies[0] || null)
      }
    } catch (error) {
      console.error('[v0] Error fetching companies:', error)
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCompany = async (company: Company) => {
    try {
      // Set this company as active
      const response = await fetch('/api/companies/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          companyId: company.id
        })
      })

      if (response.ok) {
        setSelectedCompany(company)
        setIsOpen(false)
        
        // Notify parent component
        onCompanyChange?.(company.id)
        
        toast({
          title: "Company switched",
          description: `Now viewing ${company.company_name}`
        })
        
        // Reload the page to refresh all data
        window.location.reload()
      } else {
        throw new Error('Failed to switch company')
      }
    } catch (error) {
      console.error('[v0] Error switching company:', error)
      toast({
        title: "Error",
        description: "Failed to switch company",
        variant: "destructive"
      })
    }
  }

  const handleAddCompany = () => {
    // Navigate to settings to add a new QuickBooks connection
    window.location.href = '/dashboard/settings?tab=quickbooks'
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddCompany}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Connect QuickBooks
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {selectedCompany?.company_name || "Select company..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Your Companies</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleSelectCompany(company)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{company.company_name}</div>
                <div className="text-xs text-muted-foreground">
                  {company.is_active ? 'Active' : 'Connected'}
                </div>
              </div>
              {selectedCompany?.id === company.id && (
                <Check className="h-4 w-4 flex-shrink-0 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAddCompany} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

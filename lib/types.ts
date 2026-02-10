export interface DashboardStats {
  totalScans: number
  duplicatesFound: number
  duplicatesResolved: number
  moneySaved: number
}

export interface DuplicateTransaction {
  id: string
  vendorName: string
  description?: string
  amount: number
  transactionDate: string
  transactionType: string
  confidenceScore: number
  status: 'pending' | 'kept' | 'deleted' | 'ignored'
  groupId: string
  resolvedAt?: string
}

export interface ScanHistory {
  id: string
  scanType: 'manual' | 'scheduled'
  status: 'completed' | 'failed' | 'running' | 'pending'
  startedAt: string
  completedAt?: string
  totalTransactions: number
  duplicatesFound: number
  duplicatesResolved: number
  errorMessage?: string
}

export interface Notification {
  id: string
  type: 'scan_complete' | 'duplicates_found' | 'resolution_complete' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface Profile {
  id: string
  full_name?: string
  company_name?: string
  email?: string
  avatar_url?: string
}

export interface AdvancedFilters {
  dateRange?: { from: Date; to: Date }
  amountMin?: number
  amountMax?: number
  vendors?: string[]
  transactionTypes?: string[]
  confidenceMin?: number
}

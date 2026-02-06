// Database types for Dup-Detect

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  company_name: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface QuickBooksConnection {
  id: string
  user_id: string
  company_id: string
  company_name: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  realm_id: string | null
  is_active: boolean
  connected_at: string
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface ScanSchedule {
  id: string
  user_id: string
  quickbooks_connection_id: string | null
  frequency: 'daily' | 'weekly' | 'monthly'
  day_of_week: number | null
  day_of_month: number | null
  time_of_day: string
  timezone: string
  is_active: boolean
  last_run_at: string | null
  next_run_at: string | null
  created_at: string
  updated_at: string
}

export interface ScanHistory {
  id: string
  user_id: string
  quickbooks_connection_id: string | null
  scan_type: 'manual' | 'scheduled'
  status: 'pending' | 'running' | 'completed' | 'failed'
  total_transactions: number
  duplicates_found: number
  duplicates_resolved: number
  started_at: string
  completed_at: string | null
  error_message: string | null
  created_at: string
}

export interface DuplicateTransaction {
  id: string
  scan_id: string
  user_id: string
  original_transaction_id: string
  duplicate_transaction_id: string
  transaction_type: string
  amount: number
  transaction_date: string
  vendor_name: string | null
  description: string | null
  confidence_score: number
  status: 'pending' | 'kept' | 'deleted' | 'ignored'
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string
  type: 'bug' | 'feature' | 'general'
  message: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

export interface EmailReport {
  id: string
  user_id: string
  scan_id: string | null
  recipient_email: string
  subject: string
  sent_at: string
  status: 'sent' | 'failed' | 'pending'
}

// Mock QuickBooks transaction type
export interface QuickBooksTransaction {
  id: string
  type: 'expense' | 'bill' | 'invoice' | 'payment' | 'deposit'
  amount: number
  date: string
  vendor_name: string
  description: string
  account: string
  reference_number?: string
}

// Duplicate pair for display
export interface DuplicatePair {
  id: string
  original: QuickBooksTransaction
  duplicate: QuickBooksTransaction
  confidence_score: number
  status: 'pending' | 'kept' | 'deleted' | 'ignored'
}

// Dashboard statistics
export interface DashboardStats {
  totalScans: number
  duplicatesFound: number
  duplicatesResolved: number
  moneySaved: number
  lastScanDate: string
  pendingDuplicates: number
}

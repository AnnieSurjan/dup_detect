import type { QuickBooksTransaction, DuplicatePair, ScanHistory, DashboardStats, DuplicateTransaction } from './types'

// Mock QuickBooks transactions
export const mockTransactions: QuickBooksTransaction[] = [
  {
    id: 'txn_001',
    type: 'expense',
    amount: 1250.00,
    date: '2026-01-15',
    vendor_name: 'Office Supplies Co.',
    description: 'Monthly office supplies',
    account: 'Office Expenses',
    reference_number: 'INV-2026-001',
  },
  {
    id: 'txn_002',
    type: 'expense',
    amount: 1250.00,
    date: '2026-01-15',
    vendor_name: 'Office Supplies Co',
    description: 'Monthly office supplies',
    account: 'Office Expenses',
    reference_number: 'INV-2026-001',
  },
  {
    id: 'txn_003',
    type: 'bill',
    amount: 3500.00,
    date: '2026-01-20',
    vendor_name: 'Tech Solutions LLC',
    description: 'IT Support Services - January',
    account: 'Professional Services',
    reference_number: 'BILL-456',
  },
  {
    id: 'txn_004',
    type: 'bill',
    amount: 3500.00,
    date: '2026-01-20',
    vendor_name: 'Tech Solutions LLC',
    description: 'IT Support Services - Jan',
    account: 'Professional Services',
    reference_number: 'BILL-456',
  },
  {
    id: 'txn_005',
    type: 'payment',
    amount: 850.00,
    date: '2026-01-22',
    vendor_name: 'City Utilities',
    description: 'Electricity bill January',
    account: 'Utilities',
    reference_number: 'PAY-789',
  },
  {
    id: 'txn_006',
    type: 'payment',
    amount: 850.00,
    date: '2026-01-22',
    vendor_name: 'City Utilities',
    description: 'Electricity bill - January',
    account: 'Utilities',
    reference_number: 'PAY-789',
  },
  {
    id: 'txn_007',
    type: 'expense',
    amount: 425.50,
    date: '2026-01-25',
    vendor_name: 'Travel Agency Plus',
    description: 'Flight booking - Conference',
    account: 'Travel & Entertainment',
    reference_number: 'TRV-2026-012',
  },
  {
    id: 'txn_008',
    type: 'expense',
    amount: 425.50,
    date: '2026-01-25',
    vendor_name: 'Travel Agency Plus',
    description: 'Flight booking for conference',
    account: 'Travel & Entertainment',
    reference_number: 'TRV-2026-012',
  },
  {
    id: 'txn_009',
    type: 'invoice',
    amount: 15000.00,
    date: '2026-01-28',
    vendor_name: 'Client ABC Corp',
    description: 'Consulting services - Q1',
    account: 'Revenue',
    reference_number: 'INV-C-001',
  },
  {
    id: 'txn_010',
    type: 'invoice',
    amount: 15000.00,
    date: '2026-01-28',
    vendor_name: 'ABC Corporation',
    description: 'Consulting services Q1',
    account: 'Revenue',
    reference_number: 'INV-C-001',
  },
]

// Generate mock duplicate pairs from transactions
export const mockDuplicatePairs: DuplicatePair[] = [
  {
    id: 'dup_001',
    original: mockTransactions[0],
    duplicate: mockTransactions[1],
    confidence_score: 98,
    status: 'pending',
  },
  {
    id: 'dup_002',
    original: mockTransactions[2],
    duplicate: mockTransactions[3],
    confidence_score: 95,
    status: 'pending',
  },
  {
    id: 'dup_003',
    original: mockTransactions[4],
    duplicate: mockTransactions[5],
    confidence_score: 92,
    status: 'pending',
  },
  {
    id: 'dup_004',
    original: mockTransactions[6],
    duplicate: mockTransactions[7],
    confidence_score: 88,
    status: 'pending',
  },
  {
    id: 'dup_005',
    original: mockTransactions[8],
    duplicate: mockTransactions[9],
    confidence_score: 85,
    status: 'pending',
  },
]

// Mock scan history
export const mockScanHistory: ScanHistory[] = [
  {
    id: 'scan_001',
    user_id: 'user_001',
    quickbooks_connection_id: 'qb_001',
    scan_type: 'manual',
    status: 'completed',
    total_transactions: 1250,
    duplicates_found: 5,
    duplicates_resolved: 3,
    started_at: '2026-02-01T10:00:00Z',
    completed_at: '2026-02-01T10:05:32Z',
    error_message: null,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'scan_002',
    user_id: 'user_001',
    quickbooks_connection_id: 'qb_001',
    scan_type: 'scheduled',
    status: 'completed',
    total_transactions: 1180,
    duplicates_found: 2,
    duplicates_resolved: 2,
    started_at: '2026-01-25T09:00:00Z',
    completed_at: '2026-01-25T09:04:15Z',
    error_message: null,
    created_at: '2026-01-25T09:00:00Z',
  },
  {
    id: 'scan_003',
    user_id: 'user_001',
    quickbooks_connection_id: 'qb_001',
    scan_type: 'scheduled',
    status: 'completed',
    total_transactions: 1120,
    duplicates_found: 8,
    duplicates_resolved: 8,
    started_at: '2026-01-18T09:00:00Z',
    completed_at: '2026-01-18T09:06:42Z',
    error_message: null,
    created_at: '2026-01-18T09:00:00Z',
  },
  {
    id: 'scan_004',
    user_id: 'user_001',
    quickbooks_connection_id: 'qb_001',
    scan_type: 'manual',
    status: 'failed',
    total_transactions: 0,
    duplicates_found: 0,
    duplicates_resolved: 0,
    started_at: '2026-01-10T14:30:00Z',
    completed_at: '2026-01-10T14:30:45Z',
    error_message: 'QuickBooks API connection timeout',
    created_at: '2026-01-10T14:30:00Z',
  },
]

// Stats for dashboard
export const mockDashboardStats: DashboardStats = {
  totalScans: 12,
  duplicatesFound: 47,
  duplicatesResolved: 42,
  moneySaved: 15750.50,
  lastScanDate: '2026-02-01T10:05:32Z',
  pendingDuplicates: 5,
}

// Getter functions for components
export function getMockDashboardStats(): DashboardStats {
  return { ...mockDashboardStats }
}

export function getMockScanHistory(): ScanHistory[] {
  return [...mockScanHistory]
}

export function getMockDuplicates(): DuplicateTransaction[] {
  // Convert DuplicatePair to DuplicateTransaction format
  return mockDuplicatePairs.map((pair, index) => ({
    id: pair.id,
    scan_id: 'scan_001',
    user_id: 'user_001',
    original_transaction_id: pair.original.id,
    duplicate_transaction_id: pair.duplicate.id,
    transactionType: pair.original.type.charAt(0).toUpperCase() + pair.original.type.slice(1),
    transaction_type: pair.original.type.charAt(0).toUpperCase() + pair.original.type.slice(1),
    amount: pair.original.amount,
    transactionDate: pair.original.date,
    transaction_date: pair.original.date,
    vendorName: pair.original.vendor_name,
    vendor_name: pair.original.vendor_name,
    description: pair.original.description,
    confidenceScore: pair.confidence_score,
    confidence_score: pair.confidence_score,
    status: pair.status,
    resolved_at: null,
    resolved_by: null,
    created_at: new Date().toISOString(),
  }))
}

// Function to simulate a scan
export async function simulateScan(): Promise<{
  duplicates: DuplicatePair[]
  totalTransactions: number
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return {
    duplicates: mockDuplicatePairs,
    totalTransactions: 1250,
  }
}

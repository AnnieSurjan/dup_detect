import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { access_token, company_id } = await req.json()

    if (!access_token || !company_id) {
      return NextResponse.json(
        { error: 'Missing access token or company ID' },
        { status: 400 }
      )
    }

    console.log('[v0] Fetching QB data for company:', company_id)
    
    // Use sandbox API URL for development keys
    const apiBaseUrl = 'https://sandbox-quickbooks.api.intuit.com'
    
    // Fetch transactions, invoices, and bills from QuickBooks
    const [transactionsRes, invoicesRes, billsRes] = await Promise.all([
      fetch(
        `${apiBaseUrl}/v3/company/${company_id}/query?query=${encodeURIComponent('select * from Purchase startPosition 1 maxResults 100')}`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        }
      ),
      fetch(
        `${apiBaseUrl}/v3/company/${company_id}/query?query=${encodeURIComponent('select * from Invoice startPosition 1 maxResults 100')}`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        }
      ),
      fetch(
        `${apiBaseUrl}/v3/company/${company_id}/query?query=${encodeURIComponent('select * from Bill startPosition 1 maxResults 100')}`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        }
      ),
    ])

    console.log('[v0] Response statuses:', {
      transactions: transactionsRes.status,
      invoices: invoicesRes.status,
      bills: billsRes.status,
    })

    // Check for errors
    if (!transactionsRes.ok) {
      const errorText = await transactionsRes.text()
      console.error('[v0] Transactions error:', errorText)
      throw new Error(`Transactions API error: ${transactionsRes.status} - ${errorText}`)
    }

    const [transactions, invoices, bills] = await Promise.all([
      transactionsRes.json(),
      invoicesRes.json(),
      billsRes.json(),
    ])

    console.log('[v0] Data fetched:', {
      transactions: transactions.QueryResponse?.Purchase?.length || 0,
      invoices: invoices.QueryResponse?.Invoice?.length || 0,
      bills: bills.QueryResponse?.Bill?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.QueryResponse?.Purchase || [],
        invoices: invoices.QueryResponse?.Invoice || [],
        bills: bills.QueryResponse?.Bill || [],
      },
    })
  } catch (error) {
    console.error('[v0] QB transactions error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch QuickBooks data' },
      { status: 500 }
    )
  }
}

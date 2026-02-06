import { getAuthorizationUrl } from '@/lib/quickbooks'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const authUrl = await getAuthorizationUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get authorization URL' },
      { status: 500 }
    )
  }
}

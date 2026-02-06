import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Send email using Resend API directly via fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DupDetect <onboarding@resend.dev>',
        to: email,
        subject: 'DupDetect Scan Report - Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0F766E;">DupDetect Scan Report</h1>
            <p>This is a test email from DupDetect.</p>
            <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Scan Summary</h3>
              <p><strong>Total Transactions:</strong> 1,247</p>
              <p><strong>Duplicates Found:</strong> 8</p>
              <p><strong>Duplicates Resolved:</strong> 5</p>
              <p><strong>Potential Savings:</strong> $2,000.00</p>
            </div>
            <p style="color: #666;">This email was sent as a test from DupDetect.</p>
          </div>
        `,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || `Email service error: ${response.status}` },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, messageId: data.id })
  } catch (error) {
    console.error('[v0] Email API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    )
  }
}

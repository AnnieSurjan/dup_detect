import { Resend } from 'resend'

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY)
}

interface ScanReportData {
  recipientEmail: string
  recipientName: string
  scanDate: string
  totalTransactions: number
  duplicatesFound: number
  duplicatesResolved: number
  potentialSavings: number
}

export async function sendScanReport(data: ScanReportData) {
  const {
    recipientEmail,
    recipientName,
    scanDate,
    totalTransactions,
    duplicatesFound,
    duplicatesResolved,
    potentialSavings,
  } = data

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DupDetect Scan Report</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">DupDetect</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Scan Report</p>
        </div>
        
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
            Hi ${recipientName},
          </p>
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
            Your duplicate transaction scan completed on <strong>${scanDate}</strong>. Here's a summary:
          </p>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Total Transactions Scanned</span>
              <strong style="color: #111827;">${totalTransactions.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Duplicates Found</span>
              <strong style="color: #dc2626;">${duplicatesFound}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Duplicates Resolved</span>
              <strong style="color: #16a34a;">${duplicatesResolved}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Potential Savings</span>
              <strong style="color: #0f766e; font-size: 18px;">$${potentialSavings.toLocaleString()}</strong>
            </div>
          </div>
          
          <a href="#" style="display: block; background: #0f766e; color: white; text-align: center; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            View Full Report
          </a>
        </div>
        
        <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This email was sent by DupDetect. Questions? Contact support.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const resend = getResendClient()
  const result = await resend.emails.send({
    from: 'DupDetect <onboarding@resend.dev>',
    to: recipientEmail,
    subject: `DupDetect Scan Report - ${scanDate}`,
    html: emailHtml,
  })

  return result.data
}

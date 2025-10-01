import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { sendEmail } from '../../../lib/brevo-email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get pending notifications from database
    const { data: pendingNotifications, error } = await supabaseAdmin
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Error fetching pending notifications:', error)
      return res.status(500).json({ error: 'Failed to fetch notifications' })
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No pending notifications to process',
        processed: 0
      })
    }

    let processed = 0
    let failed = 0

    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        // Send email using Brevo
        const success = await sendEmail(
          notification.recipient_email,
          notification.subject,
          notification.html_content,
          notification.text_content
        )

        if (success) {
          // Update notification status to sent
          await supabaseAdmin
            .from('notification_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', notification.id)
          
          processed++
        } else {
          // Update retry count and status
          const newRetryCount = (notification.retry_count || 0) + 1
          const maxRetries = 3
          
          if (newRetryCount >= maxRetries) {
            // Mark as failed after max retries
            await supabaseAdmin
              .from('notification_queue')
              .update({
                status: 'failed',
                error_message: 'Max retries exceeded',
                retry_count: newRetryCount,
                updated_at: new Date().toISOString()
              })
              .eq('id', notification.id)
          } else {
            // Schedule for retry (exponential backoff)
            const retryDelay = Math.pow(2, newRetryCount) * 60 * 1000 // 2^n minutes
            const nextRetry = new Date(Date.now() + retryDelay).toISOString()
            
            await supabaseAdmin
              .from('notification_queue')
              .update({
                retry_count: newRetryCount,
                scheduled_at: nextRetry,
                error_message: 'Email sending failed, scheduled for retry',
                updated_at: new Date().toISOString()
              })
              .eq('id', notification.id)
          }
          
          failed++
        }
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)
        
        // Update notification with error
        await supabaseAdmin
          .from('notification_queue')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            retry_count: (notification.retry_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', notification.id)
        
        failed++
      }
    }

    res.json({
      success: true,
      message: `Processed ${processed} notifications successfully, ${failed} failed`,
      processed,
      failed,
      total: pendingNotifications.length
    })

  } catch (error) {
    console.error('Notification processing error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

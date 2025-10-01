import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { sendTemplatedEmail } from '../../../lib/brevo-email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get all shops with partial payment reminders enabled
    const { data: shops, error: shopsError } = await supabaseAdmin
      .from('shops')
      .select(`
        id,
        shop_domain,
        name,
        partial_payment_settings!inner(
          enabled,
          send_payment_reminders,
          reminder_days_before
        )
      `)
      .eq('active', true)
      .eq('partial_payment_settings.enabled', true)
      .eq('partial_payment_settings.send_payment_reminders', true)

    if (shopsError) {
      console.error('Error fetching shops:', shopsError)
      return res.status(500).json({ error: 'Failed to fetch shops' })
    }

    let totalReminders = 0
    let totalFailed = 0

    // Process reminders for each shop
    for (const shop of shops || []) {
      try {
        const result = await processShopReminders(shop)
        totalReminders += result.sent
        totalFailed += result.failed
      } catch (error) {
        console.error(`Error processing reminders for shop ${shop.id}:`, error)
        totalFailed++
      }
    }

    // Check for overdue payments and update status
    await updateOverduePayments()

    res.json({
      success: true,
      message: `Processed ${totalReminders} payment reminders, ${totalFailed} failed`,
      reminders_sent: totalReminders,
      failed: totalFailed
    })

  } catch (error) {
    console.error('Payment reminders API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function processShopReminders(shop: any) {
  const reminderDays = shop.partial_payment_settings.reminder_days_before || [7, 3, 1]
  let sent = 0
  let failed = 0

  for (const days of reminderDays) {
    try {
      // Calculate target date (days before due date)
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + days)
      const targetDateStr = targetDate.toISOString().split('T')[0]

      // Get payments due on target date that haven't been completed
      const { data: payments, error } = await supabaseAdmin
        .from('partial_payments')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('payment_status', 'deposit_paid')
        .gte('due_date', targetDateStr)
        .lt('due_date', `${targetDateStr}T23:59:59`)

      if (error) {
        console.error(`Error fetching payments for shop ${shop.id}:`, error)
        continue
      }

      // Send reminder for each payment
      for (const payment of payments || []) {
        try {
          // Check if reminder was already sent for this day
          const { data: existingReminder } = await supabaseAdmin
            .from('payment_reminders')
            .select('id')
            .eq('payment_id', payment.id)
            .eq('reminder_days', days)
            .eq('sent_date', targetDateStr)
            .single()

          if (existingReminder) {
            continue // Already sent reminder for this day
          }

          // Send reminder email
          const success = await sendPaymentReminderEmail(shop.id, payment, days)

          if (success) {
            // Record that reminder was sent
            await supabaseAdmin
              .from('payment_reminders')
              .insert({
                payment_id: payment.id,
                shop_id: shop.id,
                reminder_days: days,
                sent_date: targetDateStr,
                sent_at: new Date().toISOString()
              })

            sent++
          } else {
            failed++
          }
        } catch (error) {
          console.error(`Error sending reminder for payment ${payment.id}:`, error)
          failed++
        }
      }
    } catch (error) {
      console.error(`Error processing ${days}-day reminders for shop ${shop.id}:`, error)
      failed++
    }
  }

  return { sent, failed }
}

async function sendPaymentReminderEmail(shopId: string, payment: any, daysUntilDue: number) {
  try {
    const dueDate = new Date(payment.due_date)
    const formattedDueDate = dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return await sendTemplatedEmail(
      shopId,
      'payment_reminder',
      payment.customer_email,
      {
        customer_name: 'Customer',
        customer_email: payment.customer_email,
        remaining_amount: payment.remaining_amount,
        due_date: formattedDueDate,
        days_until_due: daysUntilDue.toString(),
        payment_url: `${process.env.SHOPIFY_APP_URL}/payment/${payment.id}`,
        shop_name: 'Your Store'
      }
    )
  } catch (error) {
    console.error('Error sending payment reminder email:', error)
    return false
  }
}

async function updateOverduePayments() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Update payments that are past due date and not completed
    const { error } = await supabaseAdmin
      .from('partial_payments')
      .update({
        payment_status: 'overdue',
        updated_at: new Date().toISOString()
      })
      .lt('due_date', today)
      .in('payment_status', ['deposit_paid', 'pending_deposit'])

    if (error) {
      console.error('Error updating overdue payments:', error)
    }
  } catch (error) {
    console.error('Error in updateOverduePayments:', error)
  }
}

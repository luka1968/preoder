// Brevo Email Service for PreOrder Pro
// Configure BREVO_API_KEY environment variable

import { supabaseAdmin, getEmailTemplate } from './supabase'
import { EmailVariables, EmailTemplateType } from '../types'

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const BREVO_API_URL = 'https://api.brevo.com/v3'

// Brevo email interface
interface BrevoEmailRequest {
  sender: {
    name: string
    email: string
  }
  to: Array<{
    email: string
    name?: string
  }>
  subject: string
  htmlContent?: string
  textContent?: string
  templateId?: number
  params?: Record<string, any>
}

// Send email via Brevo API
export async function sendEmailViaBrevo(emailData: BrevoEmailRequest): Promise<boolean> {
  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Email sent successfully via Brevo:', result.messageId)
      return true
    } else {
      const error = await response.json()
      console.error('Brevo API error:', error)
      return false
    }
  } catch (error) {
    console.error('Error sending email via Brevo:', error)
    return false
  }
}

// Template processing function
function processTemplate(template: string, variables: EmailVariables): string {
  let processed = template

  // Replace variables in the format {{variable_name}}
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      processed = processed.replace(regex, value)
    }
  })

  return processed
}

// Send basic email
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string,
  fromName?: string
): Promise<boolean> {
  try {
    const emailData: BrevoEmailRequest = {
      sender: {
        name: fromName || 'PreOrder Pro',
        email: 'noreply@preorderpro.com'
      },
      to: [{
        email: to
      }],
      subject,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    }

    return await sendEmailViaBrevo(emailData)

  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Send templated email
export async function sendTemplatedEmail(
  shopId: string,
  templateType: EmailTemplateType,
  recipientEmail: string,
  variables: EmailVariables,
  recipientName?: string
): Promise<boolean> {
  try {
    // Get email template
    const template = await getEmailTemplate(shopId, templateType)
    
    if (!template || !template.active) {
      console.log(`Template ${templateType} not found or inactive for shop ${shopId}`)
      // Use default template
      const defaultTemplate = getDefaultTemplate(templateType)
      if (!defaultTemplate) {
        console.error(`No default template found for ${templateType}`)
        return false
      }
      
      const subject = processTemplate(defaultTemplate.subject, variables)
      const htmlContent = processTemplate(defaultTemplate.html_content, variables)
      const textContent = processTemplate(defaultTemplate.text_content, variables)
      
      return await sendEmail(recipientEmail, subject, htmlContent, textContent, variables.shop_name)
    }

    // Process template with variables
    const subject = processTemplate(template.subject, variables)
    const htmlContent = processTemplate(template.html_content, variables)
    const textContent = processTemplate(template.text_content, variables)

    // Prepare Brevo email request
    const emailData: BrevoEmailRequest = {
      sender: {
        name: variables.shop_name || 'PreOrder Pro',
        email: 'noreply@preorderpro.com'
      },
      to: [{
        email: recipientEmail,
        name: recipientName || variables.customer_name || undefined
      }],
      subject,
      htmlContent,
      textContent
    }

    // Send via Brevo API
    const success = await sendEmailViaBrevo(emailData)
    
    if (success) {
      console.log('Email sent successfully via Brevo to:', recipientEmail)
      return true
    } else {
      console.error('Failed to send email via Brevo')
      return false
    }

  } catch (error) {
    console.error('Error sending templated email:', error)
    return false
  }
}

// Send back-in-stock notification via Brevo
export async function sendBrevoBackInStockNotification(
  shopId: string,
  customerEmail: string,
  customerName: string,
  productTitle: string,
  productUrl: string,
  variantTitle?: string
): Promise<boolean> {
  const variables: EmailVariables = {
    customer_name: customerName,
    customer_email: customerEmail,
    product_title: productTitle,
    product_url: productUrl,
    variant_title: variantTitle,
    shop_name: 'Your Store'
  }

  return await sendTemplatedEmail(
    shopId,
    'back_in_stock',
    customerEmail,
    variables,
    customerName
  )
}

// Send pre-order confirmation
export async function sendPreorderConfirmation(
  shopId: string,
  customerEmail: string,
  customerName: string,
  productTitle: string,
  orderNumber?: string,
  orderUrl?: string,
  variantTitle?: string,
  deliveryDate?: string,
  deliveryNote?: string
): Promise<boolean> {
  const variables: EmailVariables = {
    customer_name: customerName,
    customer_email: customerEmail,
    product_title: productTitle,
    variant_title: variantTitle,
    order_number: orderNumber,
    order_url: orderUrl,
    delivery_date: deliveryDate,
    delivery_note: deliveryNote,
    shop_name: 'Your Store'
  }

  return await sendTemplatedEmail(
    shopId,
    'preorder_confirmation',
    customerEmail,
    variables,
    customerName
  )
}

// Send bulk back-in-stock notifications via Brevo
export async function sendBrevoBulkBackInStockNotifications(
  shopId: string,
  productId: string,
  variantId: string,
  productTitle: string,
  productUrl: string,
  variantTitle?: string
): Promise<{ sent: number, failed: number }> {
  try {
    // Get active subscriptions for this product/variant
    const { data: subscriptions, error } = await supabaseAdmin
      .from('back_in_stock_subscriptions')
      .select('*')
      .eq('shop_id', shopId)
      .eq('product_id', productId)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return { sent: 0, failed: 0 }
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found')
      return { sent: 0, failed: 0 }
    }

    let sent = 0
    let failed = 0

    // Send notification to each subscriber
    for (const subscription of subscriptions) {
      // Skip if variant-specific and doesn't match
      if (variantId && subscription.variant_id && subscription.variant_id !== variantId) {
        continue
      }

      const success = await sendBrevoBackInStockNotification(
        shopId,
        subscription.customer_email,
        subscription.customer_name || 'Customer',
        productTitle,
        productUrl,
        variantTitle
      )

      if (success) {
        sent++
        // Update subscription status to 'notified'
        await supabaseAdmin
          .from('back_in_stock_subscriptions')
          .update({
            status: 'notified',
            notified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id)
      } else {
        failed++
      }
    }

    return { sent, failed }
  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    return { sent: 0, failed: 0 }
  }
}

// Send test email
export async function sendTestEmail(to: string, shopName?: string): Promise<boolean> {
  try {
    const emailData: BrevoEmailRequest = {
      sender: {
        name: 'PreOrder Pro',
        email: 'noreply@preorderpro.com'
      },
      to: [{
        email: to
      }],
      subject: 'PreOrder Pro - Test Email',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">ðŸŽ‰ Test Email Successful!</h2>
          <p>Hello!</p>
          <p>This is a test email from <strong>PreOrder Pro</strong> for ${shopName || 'your shop'}.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">âœ?Email Configuration Status</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Brevo API connection: <strong style="color: #28a745;">Active</strong></li>
              <li>Email delivery: <strong style="color: #28a745;">Working</strong></li>
              <li>Template processing: <strong style="color: #28a745;">Ready</strong></li>
            </ul>
          </div>
          <p>You can now start using PreOrder Pro's email notification features:</p>
          <ul>
            <li>Back-in-stock notifications</li>
            <li>Pre-order confirmations</li>
            <li>Payment reminders</li>
            <li>Delivery updates</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            This email was sent by PreOrder Pro using Brevo email service.<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
      textContent: `
PreOrder Pro - Test Email

Hello!

This is a test email from PreOrder Pro for ${shopName || 'your shop'}.

If you received this email, your email configuration is working correctly!

Email Configuration Status:
âœ?Brevo API connection: Active
âœ?Email delivery: Working  
âœ?Template processing: Ready

You can now start using PreOrder Pro's email notification features:
- Back-in-stock notifications
- Pre-order confirmations
- Payment reminders
- Delivery updates

This email was sent by PreOrder Pro using Brevo email service.
If you have any questions, please contact our support team.
      `
    }

    return await sendEmailViaBrevo(emailData)

  } catch (error) {
    console.error('Error sending test email:', error)
    return false
  }
}

// Validate email configuration
export function validateEmailConfig(): boolean {
  return !!BREVO_API_KEY
}

// Get default email templates
function getDefaultTemplate(templateType: EmailTemplateType): { subject: string, html_content: string, text_content: string } | null {
  const templates = {
    back_in_stock: {
      subject: 'ðŸŽ‰ {{product_title}} is back in stock!',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Great news, {{customer_name}}!</h2>
          <p><strong>{{product_title}}</strong> is now back in stock!</p>
          {{#if variant_title}}<p>Variant: {{variant_title}}</p>{{/if}}
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{product_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Now</a>
          </div>
          <p>Don't wait - get yours before it sells out again!</p>
          <p>Thanks for shopping with {{shop_name}}!</p>
        </div>
      `,
      text_content: `
Great news, {{customer_name}}!

{{product_title}} is now back in stock!
{{#if variant_title}}Variant: {{variant_title}}{{/if}}

Shop now: {{product_url}}

Don't wait - get yours before it sells out again!

Thanks for shopping with {{shop_name}}!
      `
    },
    preorder_confirmation: {
      subject: 'âœ?Pre-order confirmed for {{product_title}}',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Pre-order Confirmed!</h2>
          <p>Hi {{customer_name}},</p>
          <p>Thank you for your pre-order! We've successfully received your order for:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">{{product_title}}</h3>
            {{#if variant_title}}<p>Variant: {{variant_title}}</p>{{/if}}
            {{#if order_number}}<p>Order #: {{order_number}}</p>{{/if}}
            {{#if delivery_date}}<p>Expected delivery: {{delivery_date}}</p>{{/if}}
            {{#if delivery_note}}<p>{{delivery_note}}</p>{{/if}}
          </div>
          <p>We'll keep you updated on your order status and let you know when it ships!</p>
          {{#if order_url}}<p><a href="{{order_url}}">View your order</a></p>{{/if}}
          <p>Thanks for shopping with {{shop_name}}!</p>
        </div>
      `,
      text_content: `
Pre-order Confirmed!

Hi {{customer_name}},

Thank you for your pre-order! We've successfully received your order for:

{{product_title}}
{{#if variant_title}}Variant: {{variant_title}}{{/if}}
{{#if order_number}}Order #: {{order_number}}{{/if}}
{{#if delivery_date}}Expected delivery: {{delivery_date}}{{/if}}
{{#if delivery_note}}{{delivery_note}}{{/if}}

We'll keep you updated on your order status and let you know when it ships!

{{#if order_url}}View your order: {{order_url}}{{/if}}

        Thanks for your business!
        {{shop_name}}
      `
    },
    partial_payment_created: {
      subject: 'Payment Confirmation - {{product_title}}',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Received!</h2>
          <p>Hi {{customer_name}},</p>
          <p>We've received your partial payment for <strong>{{product_title}}</strong>.</p>
          <p>Amount paid: {{amount_paid}}</p>
          <p>Remaining balance: {{remaining_balance}}</p>
          <p>Thanks for your order!</p>
        </div>
      `,
      text_content: `
Payment Received!

Hi {{customer_name}},

We've received your partial payment for {{product_title}}.
Amount paid: {{amount_paid}}
Remaining balance: {{remaining_balance}}

Thanks for your order!
      `
    },
    partial_payment_reminder: {
      subject: 'Payment Reminder - {{product_title}}',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Reminder</h2>
          <p>Hi {{customer_name}},</p>
          <p>This is a reminder about your remaining balance for <strong>{{product_title}}</strong>.</p>
          <p>Remaining balance: {{remaining_balance}}</p>
          <p>Please complete your payment to secure your order.</p>
        </div>
      `,
      text_content: `
Payment Reminder

Hi {{customer_name}},

This is a reminder about your remaining balance for {{product_title}}.
Remaining balance: {{remaining_balance}}

Please complete your payment to secure your order.
      `
    },
    deposit_confirmation: {
      subject: 'Deposit Confirmation - {{product_title}}',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Deposit Confirmed!</h2>
          <p>Hi {{customer_name}},</p>
          <p>We've received your deposit for <strong>{{product_title}}</strong>.</p>
          <p>Deposit amount: {{deposit_amount}}</p>
          <p>Your order is now confirmed!</p>
        </div>
      `,
      text_content: `
Deposit Confirmed!

Hi {{customer_name}},

We've received your deposit for {{product_title}}.
Deposit amount: {{deposit_amount}}

Your order is now confirmed!
      `
    }
  }

  return templates[templateType as keyof typeof templates] || null
}

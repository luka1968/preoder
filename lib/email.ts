import nodemailer from 'nodemailer'
import { supabaseAdmin, EmailTemplate, NotificationQueue, addToNotificationQueue, updateNotificationStatus, getEmailTemplate } from './supabase'
import { EmailTemplateType } from '../types'

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const BREVO_API_URL = 'https://api.brevo.com/v3'

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}

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

// Email template variables interface
interface EmailVariables {
  shop_name?: string
  customer_name?: string
  customer_email?: string
  product_title?: string
  product_url?: string
  variant_title?: string
  order_number?: string
  order_url?: string
  delivery_date?: string
  delivery_note?: string
  unsubscribe_url?: string
  [key: string]: string | undefined
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

// Create email transporter (fallback to SMTP)
export function createTransporter(config?: EmailConfig): nodemailer.Transporter {
  const emailConfig = config || {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }

  return nodemailer.createTransport(emailConfig)
}

// Template processing functions
function processTemplate(template: string, variables: EmailVariables): string {
  let processed = template

  // Replace variables in the format {{variable_name}}
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      processed = processed.replace(regex, value)
    }
  })

  // Remove any remaining unprocessed variables
  processed = processed.replace(/{{[^}]+}}/g, '')

  return processed
}

// Default email templates
const DEFAULT_TEMPLATES = {
  back_in_stock: {
    subject: '🎉 {{product_title}} is back in stock!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Great news, {{customer_name}}!</h2>
        <p>The item you were waiting for is now back in stock:</p>
        
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #ff6b35;">{{product_title}}</h3>
          {{#if variant_title}}<p style="color: #666; margin: 5px 0;">{{variant_title}}</p>{{/if}}
          <a href="{{product_url}}" style="display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">Shop Now</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Don't wait too long - items can sell out quickly!
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          You received this email because you subscribed to back-in-stock notifications for this product.
          <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a>
        </p>
      </div>
    `,
    text: `
Great news, {{customer_name}}!

The item you were waiting for is now back in stock:

{{product_title}}
{{#if variant_title}}{{variant_title}}{{/if}}

Shop now: {{product_url}}

Don't wait too long - items can sell out quickly!

You received this email because you subscribed to back-in-stock notifications for this product.
Unsubscribe: {{unsubscribe_url}}
    `
  },
  preorder_confirmation: {
    subject: '�?Pre-order confirmed: {{product_title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for your pre-order!</h2>
        <p>Hi {{customer_name}},</p>
        <p>We've received your pre-order and wanted to confirm the details:</p>
        
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; background: #f9f9f9;">
          <h3 style="margin: 0 0 15px 0; color: #ff6b35;">Order Details</h3>
          <p><strong>Product:</strong> {{product_title}}</p>
          {{#if variant_title}}<p><strong>Variant:</strong> {{variant_title}}</p>{{/if}}
          {{#if order_number}}<p><strong>Order Number:</strong> {{order_number}}</p>{{/if}}
          {{#if delivery_date}}<p><strong>Expected Delivery:</strong> {{delivery_date}}</p>{{/if}}
          {{#if delivery_note}}<p><strong>Delivery Note:</strong> {{delivery_note}}</p>{{/if}}
        </div>
        
        <p>We'll keep you updated on your order status and let you know as soon as it ships!</p>
        
        {{#if order_url}}
        <a href="{{order_url}}" style="display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">View Order</a>
        {{/if}}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Questions? Reply to this email or contact our support team.
        </p>
      </div>
    `,
    text: `
Thank you for your pre-order!

Hi {{customer_name}},

We've received your pre-order and wanted to confirm the details:

Product: {{product_title}}
{{#if variant_title}}Variant: {{variant_title}}{{/if}}
{{#if order_number}}Order Number: {{order_number}}{{/if}}
{{#if delivery_date}}Expected Delivery: {{delivery_date}}{{/if}}
{{#if delivery_note}}Delivery Note: {{delivery_note}}{{/if}}

We'll keep you updated on your order status and let you know as soon as it ships!

{{#if order_url}}View Order: {{order_url}}{{/if}}

Questions? Reply to this email or contact our support team.
    `
  },
  payment_reminder: {
    subject: '💳 Complete your pre-order payment: {{product_title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Complete Your Pre-order Payment</h2>
        <p>Hi {{customer_name}},</p>
        <p>Your pre-order is almost ready! We just need you to complete the remaining payment:</p>
        
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; background: #fff8f0;">
          <h3 style="margin: 0 0 15px 0; color: #ff6b35;">{{product_title}}</h3>
          {{#if variant_title}}<p><strong>Variant:</strong> {{variant_title}}</p>{{/if}}
          {{#if order_number}}<p><strong>Order Number:</strong> {{order_number}}</p>{{/if}}
          {{#if delivery_date}}<p><strong>Expected Delivery:</strong> {{delivery_date}}</p>{{/if}}
        </div>
        
        <p>Complete your payment to secure your pre-order:</p>
        
        {{#if order_url}}
        <a href="{{order_url}}" style="display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">Complete Payment</a>
        {{/if}}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Questions about your order? Reply to this email or contact our support team.
        </p>
      </div>
    `,
    text: `
Complete Your Pre-order Payment

Hi {{customer_name}},

Your pre-order is almost ready! We just need you to complete the remaining payment:

{{product_title}}
{{#if variant_title}}Variant: {{variant_title}}{{/if}}
{{#if order_number}}Order Number: {{order_number}}{{/if}}
{{#if delivery_date}}Expected Delivery: {{delivery_date}}{{/if}}

Complete your payment to secure your pre-order:
{{#if order_url}}{{order_url}}{{/if}}

Questions about your order? Reply to this email or contact our support team.
    `
  },
  delivery_update: {
    subject: '📦 Delivery update for your pre-order: {{product_title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Delivery Update</h2>
        <p>Hi {{customer_name}},</p>
        <p>We have an update about your pre-order delivery:</p>
        
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; background: #f0f8ff;">
          <h3 style="margin: 0 0 15px 0; color: #ff6b35;">{{product_title}}</h3>
          {{#if variant_title}}<p><strong>Variant:</strong> {{variant_title}}</p>{{/if}}
          {{#if order_number}}<p><strong>Order Number:</strong> {{order_number}}</p>{{/if}}
          {{#if delivery_date}}<p><strong>Updated Delivery Date:</strong> {{delivery_date}}</p>{{/if}}
          {{#if delivery_note}}<p><strong>Update:</strong> {{delivery_note}}</p>{{/if}}
        </div>
        
        <p>Thank you for your patience. We'll continue to keep you updated!</p>
        
        {{#if order_url}}
        <a href="{{order_url}}" style="display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">View Order</a>
        {{/if}}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Questions? Reply to this email or contact our support team.
        </p>
      </div>
    `,
    text: `
Delivery Update

Hi {{customer_name}},

We have an update about your pre-order delivery:

{{product_title}}
{{#if variant_title}}Variant: {{variant_title}}{{/if}}
{{#if order_number}}Order Number: {{order_number}}{{/if}}
{{#if delivery_date}}Updated Delivery Date: {{delivery_date}}{{/if}}
{{#if delivery_note}}Update: {{delivery_note}}{{/if}}

Thank you for your patience. We'll continue to keep you updated!

{{#if order_url}}View Order: {{order_url}}{{/if}}

Questions? Reply to this email or contact our support team.
    `
  }
}

// Main email functions
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

export async function sendTemplateEmail(
  shopId: string,
  templateType: EmailTemplate['template_type'],
  to: string,
  variables: EmailVariables,
  scheduleAt?: Date
): Promise<boolean> {
  try {
    // Get custom template or use default
    const { data: customTemplate } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('shop_id', shopId)
      .eq('template_type', templateType)
      .eq('active', true)
      .single()

    const template = customTemplate || DEFAULT_TEMPLATES[templateType]
    
    if (!template) {
      throw new Error(`Template not found: ${templateType}`)
    }

    // Process template with variables
    const subject = processTemplate(template.subject, variables)
    const htmlContent = processTemplate(template.html_content || template.html, variables)
    const textContent = processTemplate(template.text_content || template.text, variables)

    // Add to notification queue
    const notification = await addToNotificationQueue({
      shop_id: shopId,
      template_type: templateType,
      recipient_email: to,
      subject,
      html_content: htmlContent,
      text_content: textContent,
      status: 'pending',
      scheduled_at: scheduleAt?.toISOString() || new Date().toISOString(),
      retry_count: 0
    })

    // If not scheduled for later, send immediately
    if (!scheduleAt || scheduleAt <= new Date()) {
      return await processNotification(notification)
    }

    return true
  } catch (error) {
    console.error('Error sending template email:', error)
    return false
  }
}

// Send templated email using Brevo API
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
      return false
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

export async function processNotification(notification: NotificationQueue): Promise<boolean> {
  try {
    const success = await sendEmail(
      notification.recipient_email,
      notification.subject,
      notification.html_content,
      notification.text_content
    )

    if (success) {
      await updateNotificationStatus(notification.id, 'sent')
      return true
    } else {
      await updateNotificationStatus(notification.id, 'failed', 'Failed to send email')
      return false
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await updateNotificationStatus(notification.id, 'failed', errorMessage)
    return false
  }
}

export async function sendBackInStockNotification(
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
    unsubscribe_url: `${process.env.SHOPIFY_APP_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}&shop=${shopId}`
  }

  return await sendTemplateEmail(shopId, 'back_in_stock', customerEmail, variables)
}

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
    order_number: orderNumber,
    order_url: orderUrl,
    variant_title: variantTitle,
    delivery_date: deliveryDate,
    delivery_note: deliveryNote
  }

  return await sendTemplateEmail(shopId, 'preorder_confirmation', customerEmail, variables)
}

export async function sendPaymentReminder(
  shopId: string,
  customerEmail: string,
  customerName: string,
  productTitle: string,
  orderNumber?: string,
  orderUrl?: string,
  variantTitle?: string,
  deliveryDate?: string
): Promise<boolean> {
  const variables: EmailVariables = {
    customer_name: customerName,
    customer_email: customerEmail,
    product_title: productTitle,
    order_number: orderNumber,
    order_url: orderUrl,
    variant_title: variantTitle,
    delivery_date: deliveryDate
  }

  return await sendTemplateEmail(shopId, 'payment_reminder', customerEmail, variables)
}

export async function sendDeliveryUpdate(
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
    order_number: orderNumber,
    order_url: orderUrl,
    variant_title: variantTitle,
    delivery_date: deliveryDate,
    delivery_note: deliveryNote
  }

  return await sendTemplateEmail(shopId, 'delivery_update', customerEmail, variables)
}

// Bulk notification functions
export async function sendBulkBackInStockNotifications(
  shopId: string,
  productId: string,
  variantId: string | null,
  productTitle: string,
  productUrl: string,
  variantTitle?: string
): Promise<{ sent: number, failed: number }> {
  try {
    // Get all active subscriptions for this product/variant
    let query = supabaseAdmin
      .from('back_in_stock_subscriptions')
      .select('*')
      .eq('shop_id', shopId)
      .eq('product_id', productId)
      .eq('status', 'active')

    if (variantId) {
      query = query.eq('variant_id', variantId)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      throw error
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0 }
    }

    let sent = 0
    let failed = 0

    // Send notifications to all subscribers
    for (const subscription of subscriptions) {
      try {
        const success = await sendBackInStockNotification(
          shopId,
          subscription.customer_email,
          subscription.customer_name || 'Customer',
          productTitle,
          productUrl,
          variantTitle
        )

        if (success) {
          // Update subscription status to notified
          await supabaseAdmin
            .from('back_in_stock_subscriptions')
            .update({
              status: 'notified',
              notified_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id)

          sent++
        } else {
          failed++
        }
      } catch (error) {
        console.error(`Error sending notification to ${subscription.customer_email}:`, error)
        failed++
      }
    }

    return { sent, failed }
  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    return { sent: 0, failed: 0 }
  }
}

// Validate email configuration (Brevo API key)
export function validateEmailConfig(): boolean {
  return !!BREVO_API_KEY
}

// Test email function
export async function sendTestEmail(to: string, shopName: string = 'Test Shop'): Promise<boolean> {
  const subject = 'PreOrder Pro - Test Email'
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Configuration Test</h2>
      <p>This is a test email from PreOrder Pro for ${shopName}.</p>
      <p>If you received this email, your email configuration is working correctly!</p>
      <div style="background: #f0f8ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #666;">
          <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
          <strong>Sent to:</strong> ${to}
        </p>
      </div>
    </div>
  `
  const textContent = `
Email Configuration Test

This is a test email from PreOrder Pro for ${shopName}.

If you received this email, your email configuration is working correctly!

Timestamp: ${new Date().toISOString()}
Sent to: ${to}
  `

  return await sendEmail(to, subject, htmlContent, textContent)
}

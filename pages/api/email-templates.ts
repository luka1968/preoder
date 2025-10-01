import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin, getEmailTemplate, createOrUpdateEmailTemplate } from '../../lib/supabase'
import { EmailTemplateType } from '../../types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // Get all email templates for the shop
      const { data: templates, error } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .eq('shop_id', shopData.id)
        .order('template_type')

      if (error) {
        console.error('Error fetching templates:', error)
        return res.status(500).json({ error: 'Failed to fetch templates' })
      }

      res.json({ templates: templates || [] })

    } else if (req.method === 'PUT') {
      // Create or update email template
      const {
        template_type,
        subject,
        html_content,
        text_content,
        active = true
      } = req.body

      if (!template_type) {
        return res.status(400).json({ error: 'template_type is required' })
      }

      // Validate template type
      const validTypes: EmailTemplateType[] = ['back_in_stock', 'preorder_confirmation', 'payment_reminder', 'delivery_update']
      if (!validTypes.includes(template_type)) {
        return res.status(400).json({ error: 'Invalid template type' })
      }

      // If only updating active status
      if (subject === undefined && html_content === undefined && text_content === undefined) {
        const { data: template, error } = await supabaseAdmin
          .from('email_templates')
          .update({ 
            active,
            updated_at: new Date().toISOString()
          })
          .eq('shop_id', shopData.id)
          .eq('template_type', template_type)
          .select()
          .single()

        if (error) {
          console.error('Error updating template status:', error)
          return res.status(500).json({ error: 'Failed to update template' })
        }

        return res.json(template)
      }

      // Full template update/create
      if (!subject || !html_content || !text_content) {
        return res.status(400).json({ error: 'subject, html_content, and text_content are required' })
      }

      const template = await createOrUpdateEmailTemplate(shopData.id, {
        template_type,
        subject,
        html_content,
        text_content,
        active,
        variables: extractVariables(html_content + ' ' + text_content)
      })

      res.json(template)

    } else if (req.method === 'DELETE') {
      // Delete email template
      const { template_type } = req.body

      if (!template_type) {
        return res.status(400).json({ error: 'template_type is required' })
      }

      const { error } = await supabaseAdmin
        .from('email_templates')
        .delete()
        .eq('shop_id', shopData.id)
        .eq('template_type', template_type)

      if (error) {
        console.error('Error deleting template:', error)
        return res.status(500).json({ error: 'Failed to delete template' })
      }

      res.json({ success: true })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Email templates API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Extract variables from template content
function extractVariables(content: string): Record<string, string> {
  const variables: Record<string, string> = {}
  const regex = /{{([^}]+)}}/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const variable = match[1].trim()
    variables[variable] = `{{${variable}}}`
  }

  return variables
}

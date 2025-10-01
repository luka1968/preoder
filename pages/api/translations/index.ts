import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'
import { getShopLocales, getShopifyTranslations, updateShopifyTranslation } from '../../../lib/translations'

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
      // Get available locales and translations
      const locales = await getShopLocales(shop, shopData.access_token)
      
      // Get custom translations from database
      const { data: customTranslations, error } = await supabaseAdmin
        .from('shop_translations')
        .select('*')
        .eq('shop_id', shopData.id)

      if (error) {
        console.error('Error fetching custom translations:', error)
        return res.status(500).json({ error: 'Failed to fetch translations' })
      }

      res.json({
        locales,
        customTranslations: customTranslations || []
      })

    } else if (req.method === 'POST') {
      // Update translations
      const { locale, translations } = req.body

      if (!locale || !translations) {
        return res.status(400).json({ error: 'Locale and translations are required' })
      }

      // Save custom translations to database
      const translationPromises = Object.entries(translations).map(async ([key, value]) => {
        return supabaseAdmin
          .from('shop_translations')
          .upsert({
            shop_id: shopData.id,
            locale,
            translation_key: key,
            translation_value: value as string,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'shop_id,locale,translation_key'
          })
      })

      const results = await Promise.all(translationPromises)
      const errors = results.filter(result => result.error)

      if (errors.length > 0) {
        console.error('Error saving translations:', errors)
        return res.status(500).json({ error: 'Failed to save some translations' })
      }

      // Also update Shopify metafields for theme integration
      try {
        await updateShopifyMetafieldsForTranslations(
          shop, 
          shopData.access_token, 
          locale, 
          translations
        )
      } catch (error) {
        console.warn('Failed to update Shopify metafields:', error)
        // Don't fail the request if metafield update fails
      }

      res.json({ success: true })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Translations API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function updateShopifyMetafieldsForTranslations(
  shop: string,
  accessToken: string,
  locale: string,
  translations: { [key: string]: string }
) {
  // Update shop metafields with translation data
  const metafieldData = {
    namespace: 'preorder_pro',
    key: `translations_${locale}`,
    value: JSON.stringify(translations),
    type: 'json'
  }

  const response = await fetch(`https://${shop}/admin/api/2023-10/metafields.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metafield: metafieldData
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to update metafield: ${response.statusText}`)
  }

  return response.json()
}

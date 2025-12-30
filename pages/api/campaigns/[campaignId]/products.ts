import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../../lib/supabase'

/**
 * Campaign Products Management API
 * POST: Add products/variants to campaign
 * DELETE: Remove products from campaign
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { campaignId, shop } = req.query

    if (!campaignId || typeof campaignId !== 'string') {
        return res.status(400).json({ error: 'Campaign ID required' })
    }

    if (!shop || typeof shop !== 'string') {
        return res.status(400).json({ error: 'Shop parameter required' })
    }

    // Get shop data for Shopify API access
    const { data: shopData, error: shopError } = await supabaseAdmin
        .from('shops')
        .select('id, access_token, shop_domain')
        .eq('shop_domain', shop)
        .single()

    if (shopError || !shopData) {
        return res.status(404).json({ error: 'Shop not found' })
    }

    // Verify campaign belongs to shop
    const { data: campaign, error: campaignError } = await supabaseAdmin
        .from('preorder_campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('shop_id', shopData.id)
        .single()

    if (campaignError || !campaign) {
        return res.status(404).json({ error: 'Campaign not found' })
    }

    if (req.method === 'POST') {
        return handleAdd(campaignId, shopData, req, res)
    } else if (req.method === 'DELETE') {
        return handleRemove(campaignId, shopData, req, res)
    } else {
        return res.status(405).json({ error: 'Method not allowed' })
    }
}

/**
 * POST: Add products/variants to campaign
 */
async function handleAdd(
    campaignId: string,
    shopData: any,
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { products } = req.body
        // products format: [{ product_id: '123', variant_id: '456' }, ...]

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ error: 'Products array required' })
        }

        const results = []

        for (const product of products) {
            const { product_id, variant_id } = product

            if (!product_id) {
                results.push({ error: 'Missing product_id', product })
                continue
            }

            try {
                // Add to campaign_products
                const { data: campaignProduct, error } = await supabaseAdmin
                    .from('campaign_products')
                    .insert({
                        campaign_id: campaignId,
                        product_id: product_id,
                        variant_id: variant_id || null
                    })
                    .select()
                    .single()

                if (error) {
                    // Check if already exists
                    if (error.code === '23505') {
                        results.push({ success: false, message: 'Already in campaign', product })
                        continue
                    }
                    throw error
                }

                // Set metafield on variant
                if (variant_id) {
                    await setVariantMetafield(
                        shopData.shop_domain,
                        shopData.access_token,
                        variant_id,
                        'campaign_id',
                        campaignId
                    )
                }

                results.push({ success: true, campaignProduct })
            } catch (err: any) {
                results.push({ success: false, error: err.message, product })
            }
        }

        return res.status(200).json({
            success: true,
            results
        })
    } catch (error: any) {
        console.error('❌ Add products error:', error)
        return res.status(500).json({
            error: 'Failed to add products',
            details: error.message
        })
    }
}

/**
 * DELETE: Remove products from campaign
 */
async function handleRemove(
    campaignId: string,
    shopData: any,
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { variant_ids } = req.body

        if (!variant_ids || !Array.isArray(variant_ids)) {
            return res.status(400).json({ error: 'variant_ids array required' })
        }

        // Get campaign products to delete
        const { data: campaignProducts } = await supabaseAdmin
            .from('campaign_products')
            .select('*')
            .eq('campaign_id', campaignId)
            .in('variant_id', variant_ids)

        // Remove from database
        const { error } = await supabaseAdmin
            .from('campaign_products')
            .delete()
            .eq('campaign_id', campaignId)
            .in('variant_id', variant_ids)

        if (error) throw error

        // Remove metafields
        for (const variantId of variant_ids) {
            try {
                await deleteVariantMetafield(
                    shopData.shop_domain,
                    shopData.access_token,
                    variantId,
                    'campaign_id'
                )
            } catch (err) {
                console.warn(`⚠️ Failed to remove metafield for variant ${variantId}`)
            }
        }

        return res.status(200).json({
            success: true,
            removed_count: campaignProducts?.length || 0
        })
    } catch (error: any) {
        console.error('❌ Remove products error:', error)
        return res.status(500).json({
            error: 'Failed to remove products',
            details: error.message
        })
    }
}

/**
 * Set variant metafield for campaign
 */
async function setVariantMetafield(
    shop: string,
    accessToken: string,
    variantId: string,
    key: string,
    value: string
) {
    const response = await fetch(
        `https://${shop}/admin/api/2025-10/variants/${variantId}/metafields.json`,
        {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metafield: {
                    namespace: 'preorder_pro',
                    key: key,
                    value: value,
                    type: 'single_line_text_field'
                }
            })
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        console.warn(`⚠️ Failed to set metafield: ${errorText}`)
    } else {
        console.log(`🏷️ Metafield set: ${key} = ${value} for variant ${variantId}`)
    }
}

/**
 * Delete variant metafield
 */
async function deleteVariantMetafield(
    shop: string,
    accessToken: string,
    variantId: string,
    key: string
) {
    // First get metafield ID
    const listResponse = await fetch(
        `https://${shop}/admin/api/2025-10/variants/${variantId}/metafields.json`,
        {
            headers: {
                'X-Shopify-Access-Token': accessToken,
            },
        }
    )

    if (listResponse.ok) {
        const data = await listResponse.json()
        const metafield = data.metafields?.find((m: any) =>
            m.namespace === 'preorder_pro' && m.key === key
        )

        if (metafield) {
            await fetch(
                `https://${shop}/admin/api/2025-10/metafields/${metafield.id}.json`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                    },
                }
            )
            console.log(`🗑️ Metafield deleted: ${key}`)
        }
    }
}

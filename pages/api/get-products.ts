import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shop } = req.query

    if (!shop) {
      return res.status(400).json({ error: '缺少 shop 参数' })
    }

    // 获取店铺的 access token
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shop)
      .single()

    if (shopError || !shopData || !shopData.access_token) {
      return res.status(404).json({ error: '店铺未找到或未授权' })
    }

    // 获取产品列表
    const response = await fetch(
      `https://${shop}/admin/api/2023-10/products.json?limit=10`,
      {
        headers: {
          'X-Shopify-Access-Token': shopData.access_token,
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(500).json({ error: 'Shopify API 错误', details: errorText })
    }

    const data = await response.json()
    
    // 简化产品数据
    const products = data.products.map((product: any) => ({
      id: product.id,
      title: product.title,
      variants: product.variants.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        price: variant.price,
        inventory_quantity: variant.inventory_quantity
      }))
    }))

    return res.status(200).json({ products })

  } catch (error: any) {
    console.error('获取产品失败:', error)
    return res.status(500).json({ error: '服务器错误', message: error.message })
  }
}

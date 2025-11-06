import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = 'arivi-shop.myshopify.com'
    const newScope = 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_customers,write_customers,write_draft_orders,read_draft_orders'
    
    const { data, error } = await supabaseAdmin
      .from('shops')
      .update({ scope: newScope })
      .eq('shop_domain', shop)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      message: '✅ 数据库 scope 已更新',
      newScope: data.scope
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

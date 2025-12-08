import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../lib/supabase';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false
  }
};

// 获取原始请求体
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// 验证 Shopify Webhook
function verifyShopifyWebhook(req: NextApiRequest, rawBody: string): boolean {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];

  if (!hmacHeader || typeof hmacHeader !== 'string') {
    return false;
  }

  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(rawBody, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const rawBodyString = rawBody.toString('utf8');

    // 验证 webhook
    if (!verifyShopifyWebhook(req, rawBodyString)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const shop = req.headers['x-shopify-shop-domain'] as string;
    const order = JSON.parse(rawBodyString);

    console.log('📥 Received order webhook:', {
      orderId: order.id,
      orderName: order.name,
      shop: shop
    });

    // 检查是否是预购订单
    let isPreorder = false;
    let preorderItems = [];

    for (const item of order.line_items) {
      if (item.properties) {
        const preorderProp = item.properties.find(
          (p: any) => p.name === '_preorder' && p.value === 'true'
        );
        if (preorderProp) {
          isPreorder = true;
          preorderItems.push({
            product_id: item.product_id,
            variant_id: item.variant_id,
            title: item.title,
            quantity: item.quantity
          });
        }
      }
    }

    if (!isPreorder) {
      console.log('ℹ️ Not a preorder, skipping');
      return res.status(200).json({ message: 'Not a preorder' });
    }

    console.log('✅ Preorder detected:', preorderItems);

    // 获取 shop_id
    const { data: shopData } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('shop_domain', shop)
      .single();

    if (!shopData) {
      console.error('❌ Shop not found:', shop);
      return res.status(404).json({ error: 'Shop not found' });
    }

    // 保存到数据库
    const { data, error } = await supabaseAdmin
      .from('preorder_orders')
      .insert({
        shop_id: shopData.id,
        shopify_order_id: order.id.toString(),
        product_id: preorderItems[0]?.product_id?.toString() || '',
        variant_id: preorderItems[0]?.variant_id?.toString() || '',
        customer_email: order.email,
        total_amount: order.total_price,
        paid_amount: order.financial_status === 'paid' ? order.total_price : '0.00',
        payment_status: order.financial_status,
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        order_tags: order.tags ? order.tags.split(', ') : []
      });

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ error: 'Database error', details: error });
    }

    console.log('✅ Preorder saved to database:', data);

    return res.status(200).json({
      success: true,
      message: 'Preorder processed',
      orderId: order.id,
      preorderItems: preorderItems.length
    });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase';

/**
 * 手动安装预购脚本
 * 不需要 App Embed，直接注入 Script Tag
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop } = req.body;

    if (!shop) {
      return res.status(400).json({
        error: 'Missing shop parameter'
      });
    }

    // 从数据库获取店铺的 access token
    const { data: shopData, error: dbError } = await supabaseAdmin
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shop)
      .single();

    if (dbError || !shopData) {
      return res.status(404).json({
        success: false,
        error: '店铺未找到或未安装 App',
        message: '请先安装 App 到你的店铺',
      });
    }

    const accessToken = shopData.access_token;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preorder.orbrother.com';
    const scriptUrl = `${appUrl}/shopify-integration.js`;

    console.log('🚀 Manual install script for:', shop);
    console.log('Script URL:', scriptUrl);

    // 检查是否已存在脚本
    const existingScriptsResponse = await fetch(
      `https://${shop}/admin/api/2024-01/script_tags.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!existingScriptsResponse.ok) {
      throw new Error('Failed to fetch existing script tags');
    }

    const existingScripts = await existingScriptsResponse.json();
    const scriptExists = existingScripts.script_tags?.some(
      (script: any) =>
        script.src === scriptUrl ||
        script.src.includes('shopify-integration.js') ||
        script.src.includes('universal-preorder.js')
    );

    if (scriptExists) {
      console.log('✅ Script already exists for:', shop);
      return res.status(200).json({
        success: true,
        message: '预购脚本已经安装，无需重复安装',
        scriptUrl,
      });
    }

    // 创建新的 Script Tag
    const createResponse = await fetch(
      `https://${shop}/admin/api/2024-01/script_tags.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script_tag: {
            event: 'onload',
            src: scriptUrl,
            display_scope: 'online_store',
          },
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create script tag: ${JSON.stringify(errorData)}`);
    }

    const scriptTag = await createResponse.json();

    console.log('✅ Script installed successfully for:', shop);
    console.log('Script Tag ID:', scriptTag.script_tag.id);

    return res.status(200).json({
      success: true,
      message: '预购脚本安装成功！',
      scriptTag: scriptTag.script_tag,
      scriptUrl,
    });

  } catch (error: any) {
    console.error('Manual install script error:', error);
    return res.status(500).json({
      success: false,
      error: '安装失败',
      message: error.message,
      details: '请确保 App 已安装到店铺，并且有正确的权限',
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * App 安装后自动注入预购脚本
 * 在 OAuth 回调中调用此 API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop, accessToken } = req.body;

    if (!shop || !accessToken) {
      return res.status(400).json({ 
        error: 'Missing required parameters: shop and accessToken' 
      });
    }

    console.log('🚀 Auto-installing PreOrder script for:', shop);

    // 获取当前部署的URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.VERCEL_URL || 
                   'https://shopmall.dpdns.org';
    
    const scriptUrl = `${appUrl}/shopify-integration.js`;

    // 检查是否已存在相同的脚本
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
      (script: any) => script.src === scriptUrl || script.src.includes('shopify-integration.js')
    );

    if (scriptExists) {
      console.log('✅ PreOrder script already exists for:', shop);
      return res.status(200).json({
        success: true,
        message: 'PreOrder script already installed',
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

    console.log('✅ PreOrder script installed successfully for:', shop);

    return res.status(200).json({
      success: true,
      message: 'PreOrder script installed successfully',
      scriptTag: scriptTag.script_tag,
      scriptUrl,
    });

  } catch (error: any) {
    console.error('Auto-install script error:', error);
    return res.status(500).json({
      error: 'Failed to auto-install script',
      details: error.message,
    });
  }
}

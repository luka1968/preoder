import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 卸载 Script Tag
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://preorder-pro-fix.vercel.app';
    const scriptUrl = `${appUrl}/shopify-integration.js`;

    // 获取所有 Script Tags
    const scriptsResponse = await fetch(
      `https://${shop}/admin/api/2024-01/script_tags.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!scriptsResponse.ok) {
      throw new Error('Failed to fetch script tags');
    }

    const scripts = await scriptsResponse.json();
    const targetScript = scripts.script_tags?.find(
      (script: any) => script.src === scriptUrl
    );

    if (!targetScript) {
      return res.status(200).json({
        success: true,
        message: 'Script tag not found (already removed)',
      });
    }

    // 删除 Script Tag
    const deleteResponse = await fetch(
      `https://${shop}/admin/api/2024-01/script_tags/${targetScript.id}.json`,
      {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete script tag');
    }

    return res.status(200).json({
      success: true,
      message: 'Script tag uninstalled successfully',
      scriptId: targetScript.id,
    });

  } catch (error: any) {
    console.error('Uninstall script tag error:', error);
    return res.status(500).json({
      error: 'Failed to uninstall script tag',
      details: error.message,
    });
  }
}

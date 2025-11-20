import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    hasApiKey: !!process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
    apiKeyLength: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY?.length || 0,
    hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
    hasAppUrl: !!process.env.SHOPIFY_APP_URL,
    appUrl: process.env.SHOPIFY_APP_URL,
    hasScopes: !!process.env.SHOPIFY_SCOPES,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}

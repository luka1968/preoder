import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 检查所有必需的环境变量
    const config = {
      shopify: {
        apiKey: process.env.SHOPIFY_API_KEY,
        apiSecret: process.env.SHOPIFY_API_SECRET,
        appUrl: process.env.SHOPIFY_APP_URL,
        scopes: process.env.SHOPIFY_SCOPES,
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      email: {
        brevoApiKey: process.env.BREVO_API_KEY,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
      },
      app: {
        nodeEnv: process.env.NODE_ENV,
        nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
      }
    }

    // 检查状态
    const status = {
      shopify: {
        hasApiKey: !!config.shopify.apiKey,
        hasApiSecret: !!config.shopify.apiSecret,
        hasAppUrl: !!config.shopify.appUrl,
        hasScopes: !!config.shopify.scopes,
        apiKeyLength: config.shopify.apiKey?.length || 0,
        appUrlCorrect: config.shopify.appUrl === 'https://shopmall.dpdns.org',
      },
      supabase: {
        hasUrl: !!config.supabase.url,
        hasAnonKey: !!config.supabase.anonKey,
        hasServiceRoleKey: !!config.supabase.serviceRoleKey,
      },
      email: {
        hasBrevoKey: !!config.email.brevoApiKey,
        hasSmtpConfig: !!(config.email.smtpHost && config.email.smtpPort),
      },
      app: {
        isProduction: config.app.nodeEnv === 'production',
        hasPublicUrl: !!config.app.nextPublicAppUrl,
      }
    }

    // 计算总体健康度
    const allChecks = [
      status.shopify.hasApiKey,
      status.shopify.hasApiSecret,
      status.shopify.hasAppUrl,
      status.shopify.hasScopes,
      status.supabase.hasUrl,
      status.supabase.hasAnonKey,
      status.supabase.hasServiceRoleKey,
    ]

    const passedChecks = allChecks.filter(Boolean).length
    const totalChecks = allChecks.length
    const healthScore = Math.round((passedChecks / totalChecks) * 100)

    // 生成建议
    const recommendations = []

    if (!status.shopify.hasApiKey) {
      recommendations.push('❌ 缺少 SHOPIFY_API_KEY - 从 Shopify Partner Dashboard 获取')
    }
    if (!status.shopify.hasApiSecret) {
      recommendations.push('❌ 缺少 SHOPIFY_API_SECRET - 从 Shopify Partner Dashboard 获取')
    }
    if (!status.shopify.hasAppUrl) {
      recommendations.push('❌ 缺少 SHOPIFY_APP_URL - 应该设置为 https://shopmall.dpdns.org')
    }
    if (!status.shopify.appUrlCorrect) {
      recommendations.push(`⚠️ SHOPIFY_APP_URL 不正确 - 当前: ${config.shopify.appUrl}, 应该是: https://shopmall.dpdns.org`)
    }
    if (!status.shopify.hasScopes) {
      recommendations.push('❌ 缺少 SHOPIFY_SCOPES - 需要设置 API 权限范围')
    }
    if (!status.supabase.hasUrl) {
      recommendations.push('❌ 缺少 NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!status.supabase.hasServiceRoleKey) {
      recommendations.push('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 所有配置都正确！')
    }

    // 返回结果
    return res.status(200).json({
      healthy: healthScore === 100,
      healthScore,
      passedChecks,
      totalChecks,
      status,
      recommendations,
      config: {
        shopify: {
          apiKey: config.shopify.apiKey ? `${config.shopify.apiKey.substring(0, 8)}...` : null,
          apiSecret: config.shopify.apiSecret ? '***' : null,
          appUrl: config.shopify.appUrl,
          scopes: config.shopify.scopes,
        },
        supabase: {
          url: config.supabase.url,
          anonKey: config.supabase.anonKey ? `${config.supabase.anonKey.substring(0, 20)}...` : null,
          serviceRoleKey: config.supabase.serviceRoleKey ? '***' : null,
        },
        email: {
          brevoApiKey: config.email.brevoApiKey ? '***' : null,
          smtpHost: config.email.smtpHost,
          smtpPort: config.email.smtpPort,
        },
        app: {
          nodeEnv: config.app.nodeEnv,
          nextPublicAppUrl: config.app.nextPublicAppUrl,
        }
      }
    })

  } catch (error: any) {
    console.error('配置检查错误:', error)
    return res.status(500).json({
      error: '配置检查失败',
      details: error.message
    })
  }
}

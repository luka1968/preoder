/**
 * 环境变量验证和安全检查
 */

export interface EnvironmentConfig {
  // Shopify 配置
  SHOPIFY_API_KEY: string
  SHOPIFY_API_SECRET: string
  SHOPIFY_SCOPES: string
  SHOPIFY_APP_URL: string
  SHOPIFY_WEBHOOK_SECRET: string
  
  // Supabase 配置
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_PROJECT_ID: string
  
  // 安全配置
  JWT_SECRET: string
  NEXTAUTH_SECRET?: string
  NEXTAUTH_URL?: string
  CRON_SECRET?: string
  
  // 邮件配置
  BREVO_API_KEY?: string
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  
  // 应用配置
  NODE_ENV: string
  NEXT_PUBLIC_APP_URL?: string
}

/**
 * 验证必需的环境变量
 */
export function validateEnvironmentVariables(): EnvironmentConfig {
  const requiredVars = [
    'SHOPIFY_API_KEY',
    'SHOPIFY_API_SECRET', 
    'SHOPIFY_SCOPES',
    'SHOPIFY_APP_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ]
  
  // 检查必需变量
  const missing = requiredVars.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`)
  }
  
  // 验证变量格式和安全性
  const config = process.env as any as EnvironmentConfig
  
  // 验证 JWT Secret 长度
  if (config.JWT_SECRET.length < 32) {
    throw new Error('❌ JWT_SECRET must be at least 32 characters long for security')
  }
  
  // 验证 Supabase URL 格式
  if (!config.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL')
  }
  
  // 验证 Shopify App URL 格式
  if (!config.SHOPIFY_APP_URL.startsWith('https://')) {
    throw new Error('❌ SHOPIFY_APP_URL must be a valid HTTPS URL')
  }
  
  // 检查是否使用了示例值
  const exampleValues = [
    'your_shopify_api_key_here',
    'your_shopify_api_secret_here',
    'your_supabase_anon_key_here',
    'your_supabase_service_role_key_here',
    'your_jwt_secret_key_minimum_32_characters_long'
  ]
  
  const usingExamples = Object.entries(config).filter(([key, value]) => 
    exampleValues.includes(value as string)
  )
  
  if (usingExamples.length > 0) {
    throw new Error(`❌ Please replace example values in environment variables: ${usingExamples.map(([key]) => key).join(', ')}`)
  }
  
  // 验证 Shopify API Key 格式 (通常是32字符的十六进制)
  if (!/^[a-f0-9]{32}$/.test(config.SHOPIFY_API_KEY)) {
    console.warn('⚠️  SHOPIFY_API_KEY format may be incorrect (expected 32 hex characters)')
  }
  
  // 验证 Supabase JWT 格式
  if (!config.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (should be a JWT token)')
  }
  
  if (!config.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
    throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY appears to be invalid (should be a JWT token)')
  }
  
  return config
}

/**
 * 检查环境变量安全性
 */
export function checkEnvironmentSecurity(): void {
  const config = process.env as any as EnvironmentConfig
  
  const warnings: string[] = []
  
  // 检查是否在生产环境中使用了开发配置
  if (config.NODE_ENV === 'production') {
    if (config.SHOPIFY_APP_URL?.includes('localhost') || 
        config.SHOPIFY_APP_URL?.includes('127.0.0.1')) {
      warnings.push('🚨 Using localhost URL in production environment')
    }
    
    if (config.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      warnings.push('🚨 Using localhost Supabase URL in production')
    }
  }
  
  // 检查弱密钥
  if (config.JWT_SECRET === 'your_jwt_secret_key_minimum_32_characters_long') {
    warnings.push('🚨 Using default JWT_SECRET - this is a security risk!')
  }
  
  if (config.JWT_SECRET.length < 64) {
    warnings.push('⚠️  JWT_SECRET should be at least 64 characters for better security')
  }
  
  // 检查是否有明文密码
  const sensitiveVars = ['SHOPIFY_API_SECRET', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET']
  sensitiveVars.forEach(varName => {
    const value = config[varName as keyof EnvironmentConfig]
    if (value && (value.includes('password') || value.includes('123456'))) {
      warnings.push(`🚨 ${varName} appears to contain weak or obvious values`)
    }
  })
  
  if (warnings.length > 0) {
    console.warn('🔒 Security warnings:')
    warnings.forEach(warning => console.warn(`  ${warning}`))
  }
}

/**
 * 获取安全的环境变量配置 (隐藏敏感信息)
 */
export function getSafeEnvironmentInfo(): Record<string, string> {
  const config = process.env as any as EnvironmentConfig
  
  return {
    NODE_ENV: config.NODE_ENV,
    SHOPIFY_APP_URL: config.SHOPIFY_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: config.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_APP_URL: config.NEXT_PUBLIC_APP_URL || 'Not set',
    
    // 隐藏敏感信息
    SHOPIFY_API_KEY: config.SHOPIFY_API_KEY ? `${config.SHOPIFY_API_KEY.slice(0, 8)}...` : 'Not set',
    SHOPIFY_API_SECRET: config.SHOPIFY_API_SECRET ? 'Set (hidden)' : 'Not set',
    SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'Not set',
    JWT_SECRET: config.JWT_SECRET ? `Set (${config.JWT_SECRET.length} chars)` : 'Not set',
    BREVO_API_KEY: config.BREVO_API_KEY ? 'Set (hidden)' : 'Not set',
  }
}

/**
 * 在应用启动时验证环境变量
 */
export function initializeEnvironment(): void {
  try {
    console.log('🔍 Validating environment variables...')
    
    const config = validateEnvironmentVariables()
    checkEnvironmentSecurity()
    
    console.log('✅ Environment validation passed')
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Environment info:', getSafeEnvironmentInfo())
    }
    
  } catch (error) {
    console.error('💥 Environment validation failed:', error)
    process.exit(1)
  }
}

/**
 * 用于健康检查的环境状态
 */
export function getEnvironmentHealth(): {
  status: 'healthy' | 'warning' | 'error'
  message: string
  details: Record<string, boolean>
} {
  try {
    const config = validateEnvironmentVariables()
    
    const checks = {
      shopify_configured: !!(config.SHOPIFY_API_KEY && config.SHOPIFY_API_SECRET),
      supabase_configured: !!(config.NEXT_PUBLIC_SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY),
      security_configured: !!(config.JWT_SECRET && config.JWT_SECRET.length >= 32),
      app_url_configured: !!(config.SHOPIFY_APP_URL && config.SHOPIFY_APP_URL.startsWith('https://')),
      email_configured: !!(config.BREVO_API_KEY || (config.SMTP_HOST && config.SMTP_USER))
    }
    
    const allHealthy = Object.values(checks).every(Boolean)
    const criticalHealthy = checks.shopify_configured && 
                           checks.supabase_configured && 
                           checks.security_configured && 
                           checks.app_url_configured
    
    if (allHealthy) {
      return {
        status: 'healthy',
        message: 'All environment variables are properly configured',
        details: checks
      }
    } else if (criticalHealthy) {
      return {
        status: 'warning', 
        message: 'Core functionality configured, some optional features may be unavailable',
        details: checks
      }
    } else {
      return {
        status: 'error',
        message: 'Critical environment variables are missing or misconfigured',
        details: checks
      }
    }
    
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Environment validation failed',
      details: {}
    }
  }
}

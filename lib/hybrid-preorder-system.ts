// PreOrder Pro - 混合模式系统
// App Embed Block + Script Tags 双重保障

export interface HybridSystemConfig {
  shop: string
  accessToken: string
  appUrl: string
  forceScriptTag?: boolean
  debug?: boolean
}

export interface DeploymentResult {
  success: boolean
  method: 'app_embed' | 'script_tag' | 'hybrid'
  appEmbedStatus: 'deployed' | 'failed' | 'not_attempted'
  scriptTagStatus: 'deployed' | 'failed' | 'not_attempted'
  message: string
  details?: any
}

// 混合部署系统
export class HybridPreorderSystem {
  private config: HybridSystemConfig

  constructor(config: HybridSystemConfig) {
    this.config = config
  }

  // 主部署方�?- 混合模式
  async deploy(): Promise<DeploymentResult> {
    const result: DeploymentResult = {
      success: false,
      method: 'hybrid',
      appEmbedStatus: 'not_attempted',
      scriptTagStatus: 'not_attempted',
      message: ''
    }

    try {
      // 步骤1: 尝试部署 App Embed Block
      if (!this.config.forceScriptTag) {
        const embedResult = await this.deployAppEmbed()
        result.appEmbedStatus = embedResult.success ? 'deployed' : 'failed'
        
        if (embedResult.success) {
          result.success = true
          result.method = 'app_embed'
          result.message = '�?App Embed Block 部署成功 (推荐方案)'
          
          // 即使 App Embed 成功，也部署 Script Tag 作为备用
          const scriptResult = await this.deployScriptTag()
          result.scriptTagStatus = scriptResult.success ? 'deployed' : 'failed'
          
          if (scriptResult.success) {
            result.message += ' + Script Tag 备用方案已就�?
          }
          
          return result
        }
      }

      // 步骤2: App Embed 失败或被跳过，使�?Script Tag
      const scriptResult = await this.deployScriptTag()
      result.scriptTagStatus = scriptResult.success ? 'deployed' : 'failed'
      
      if (scriptResult.success) {
        result.success = true
        result.method = 'script_tag'
        result.message = '�?Script Tag 部署成功 (备用方案)'
        return result
      }

      // 步骤3: 都失败了
      result.message = '�?所有部署方案都失败�?
      return result

    } catch (error) {
      result.message = `�?部署过程中发生错�? ${error}`
      return result
    }
  }

  // 部署 App Embed Block
  private async deployAppEmbed(): Promise<{ success: boolean, details?: any }> {
    try {
      // 检查是否已�?App Embed Block
      const existingEmbeds = await this.checkExistingAppEmbeds()
      
      if (existingEmbeds.hasPreorderEmbed) {
        return { 
          success: true, 
          details: { message: 'App Embed Block 已存�?, existing: true }
        }
      }

      // 这里应该调用 Shopify CLI �?Admin API 来部�?App Embed
      // 由于 App Embed 需要通过 CLI 部署，我们标记为需要手动部�?      return { 
        success: false, 
        details: { 
          message: 'App Embed Block 需要通过 Shopify CLI 部署',
          command: 'shopify app deploy'
        }
      }

    } catch (error) {
      return { success: false, details: { error: error } }
    }
  }

  // 部署 Script Tag
  private async deployScriptTag(): Promise<{ success: boolean, details?: any }> {
    try {
      // 检查现有的 Script Tags
      const existingScripts = await this.getExistingScriptTags()
      
      // 删除旧的预购脚本
      await this.cleanupOldScripts(existingScripts)

      // 创建新的混合模式脚本
      const scriptUrl = `${this.config.appUrl}/hybrid-preorder.js`
      
      const response = await fetch(`https://${this.config.shop}/admin/api/2023-10/script_tags.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': this.config.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script_tag: {
            event: 'onload',
            src: scriptUrl,
            display_scope: 'online_store'
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Script Tag 创建失败: ${error}`)
      }

      const result = await response.json()
      
      return { 
        success: true, 
        details: { 
          scriptId: result.script_tag.id,
          scriptUrl: scriptUrl,
          message: 'Script Tag 创建成功'
        }
      }

    } catch (error) {
      return { success: false, details: { error: error } }
    }
  }

  // 检查现有的 App Embed Blocks
  private async checkExistingAppEmbeds(): Promise<{ hasPreorderEmbed: boolean, details?: any }> {
    try {
      // 这里应该检查主题中是否已有我们�?App Embed Block
      // 由于无法直接通过 API 检查，我们返回 false �?Script Tag 处理
      return { hasPreorderEmbed: false }
    } catch (error) {
      return { hasPreorderEmbed: false, details: { error } }
    }
  }

  // 获取现有�?Script Tags
  private async getExistingScriptTags(): Promise<any[]> {
    try {
      const response = await fetch(`https://${this.config.shop}/admin/api/2023-10/script_tags.json`, {
        headers: {
          'X-Shopify-Access-Token': this.config.accessToken,
        }
      })

      if (!response.ok) {
        throw new Error('获取 Script Tags 失败')
      }

      const result = await response.json()
      return result.script_tags || []

    } catch (error) {
      console.error('获取 Script Tags 错误:', error)
      return []
    }
  }

  // 清理旧的预购脚本
  private async cleanupOldScripts(scriptTags: any[]): Promise<void> {
    const preorderScripts = scriptTags.filter((tag: any) => 
      tag.src.includes('preorder') || 
      tag.src.includes('universal') ||
      tag.src.includes('hybrid-preorder') ||
      tag.src.includes(this.config.appUrl)
    )

    for (const script of preorderScripts) {
      try {
        await fetch(`https://${this.config.shop}/admin/api/2023-10/script_tags/${script.id}.json`, {
          method: 'DELETE',
          headers: {
            'X-Shopify-Access-Token': this.config.accessToken,
          }
        })
        
        if (this.config.debug) {
          console.log('删除旧脚�?', script.id)
        }
      } catch (error) {
        console.error('删除脚本失败:', script.id, error)
      }
    }
  }

  // 检查部署状�?  async checkStatus(): Promise<{
    appEmbedActive: boolean
    scriptTagActive: boolean
    overallStatus: 'active' | 'partial' | 'inactive'
    recommendations: string[]
  }> {
    const scriptTags = await this.getExistingScriptTags()
    const hasScriptTag = scriptTags.some((tag: any) => 
      tag.src.includes('hybrid-preorder') || tag.src.includes(this.config.appUrl)
    )

    // 简化检�?- 主要依赖 Script Tag
    const appEmbedActive = false // 需要手动检�?    const scriptTagActive = hasScriptTag

    let overallStatus: 'active' | 'partial' | 'inactive'
    const recommendations: string[] = []

    if (appEmbedActive && scriptTagActive) {
      overallStatus = 'active'
      recommendations.push('�?混合模式运行正常，覆盖率最�?)
    } else if (scriptTagActive) {
      overallStatus = 'partial'
      recommendations.push('⚠️ Script Tag 模式运行中，建议部署 App Embed Block 以获得最佳体�?)
      recommendations.push('运行: shopify app deploy')
    } else {
      overallStatus = 'inactive'
      recommendations.push('�?预购功能未激活，需要部�?)
    }

    return {
      appEmbedActive,
      scriptTagActive,
      overallStatus,
      recommendations
    }
  }
}

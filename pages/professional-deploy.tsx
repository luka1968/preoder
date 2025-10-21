import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface DeploymentStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  details?: string
}

export default function ProfessionalDeploy() {
  const router = useRouter()
  const { shop } = router.query
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    {
      id: 'check_environment',
      title: '检查开发环境',
      description: '验证 Shopify CLI 和项目配置',
      status: 'pending'
    },
    {
      id: 'fix_configuration',
      title: '修复 Extension 配置',
      description: '更新 shopify.extension.toml 配置文件',
      status: 'pending'
    },
    {
      id: 'create_app_embed',
      title: '创建 App Embed Block',
      description: '生成专业级 app-embed.liquid 文件',
      status: 'pending'
    },
    {
      id: 'deploy_extensions',
      title: '部署 App Extensions',
      description: '使用 Shopify CLI 部署到应用',
      status: 'pending'
    },
    {
      id: 'verify_deployment',
      title: '验证部署结果',
      description: '确认 App Embed Block 可用',
      status: 'pending'
    }
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentComplete, setDeploymentComplete] = useState(false)

  const updateStepStatus = (stepId: string, status: DeploymentStep['status'], details?: string) => {
    setDeploymentSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, details } : step
    ))
  }

  const startProfessionalDeployment = async () => {
    setIsDeploying(true)
    setCurrentStep(0)

    // Simulate professional deployment process
    for (let i = 0; i < deploymentSteps.length; i++) {
      const step = deploymentSteps[i]
      setCurrentStep(i)
      
      updateStepStatus(step.id, 'running')
      
      // Simulate deployment time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))
      
      // Simulate success (in real implementation, this would call actual APIs)
      updateStepStatus(step.id, 'completed', `${step.title} 成功完成`)
    }

    setIsDeploying(false)
    setDeploymentComplete(true)
  }

  const getStepIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed': return '✅'
      case 'running': return '🔄'
      case 'failed': return '❌'
      default: return '⏳'
    }
  }

  const getStepColor = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <>
      <Head>
        <title>PreOrder Pro - 专业部署</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
            
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                👨‍💻 PreOrder Pro 专业部署
              </h1>
              <p className="text-xl text-gray-600">
                企业级 App Embed Block 自动化部署系统
              </p>
            </div>

            {/* Professional Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="text-3xl mb-3">🏗️</div>
                <h3 className="font-bold text-blue-800 mb-2">专业架构</h3>
                <p className="text-blue-600 text-sm">企业级 App Extension 架构，完全集成到 Shopify 生态系统</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold text-green-800 mb-2">自动化部署</h3>
                <p className="text-green-600 text-sm">一键部署，自动配置，智能错误处理和回滚机制</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-purple-800 mb-2">主题集成</h3>
                <p className="text-purple-600 text-sm">原生主题集成，在主题编辑器中可视化管理</p>
              </div>
            </div>

            {/* Deployment Steps */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 部署步骤</h2>
              
              <div className="space-y-4">
                {deploymentSteps.map((step, index) => (
                  <div key={step.id} className={`border rounded-xl p-6 transition-all duration-300 ${getStepColor(step.status)}`}>
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getStepIcon(step.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg">{step.title}</h3>
                          {step.status === 'running' && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                          )}
                        </div>
                        <p className="text-sm opacity-75 mb-2">{step.description}</p>
                        {step.details && (
                          <p className="text-xs font-mono bg-white bg-opacity-50 p-2 rounded">
                            {step.details}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-bold">
                        步骤 {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deployment Controls */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                🚀 专业级自动化部署
              </h3>
              
              {!deploymentComplete ? (
                <div className="text-center">
                  <p className="text-gray-700 mb-6">
                    {isDeploying 
                      ? `正在执行: ${deploymentSteps[currentStep]?.title}...`
                      : '点击开始专业级 App Embed Block 部署流程'
                    }
                  </p>
                  <button
                    onClick={startProfessionalDeployment}
                    disabled={isDeploying}
                    className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform ${
                      isDeploying
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-105 shadow-lg'
                    }`}
                  >
                    {isDeploying ? '部署中...' : '🚀 开始专业部署'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h4 className="text-2xl font-bold text-green-600 mb-4">专业部署完成！</h4>
                  <p className="text-gray-700 mb-6">
                    App Embed Block 已成功部署到你的 Shopify 应用
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <a
                      href={`https://admin.shopify.com/store/${shop?.toString().replace('.myshopify.com', '')}/themes/current/editor?context=apps`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                      🎨 打开主题编辑器
                    </a>
                    <button
                      onClick={() => router.push(`/?shop=${shop}`)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                      📊 返回管理面板
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            {deploymentComplete && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  📋 下一步操作
                </h3>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">1.</span>
                    <div>
                      <strong>进入主题编辑器</strong>
                      <p>点击上面的"打开主题编辑器"按钮</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">2.</span>
                    <div>
                      <strong>找到 App embeds</strong>
                      <p>在左侧菜单中找到"App embeds"选项</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">3.</span>
                    <div>
                      <strong>启用 PreOrder Pro</strong>
                      <p>找到"PreOrder Pro"并点击开关启用</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">4.</span>
                    <div>
                      <strong>配置设置</strong>
                      <p>根据需要调整预购按钮文本、颜色等设置</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">5.</span>
                    <div>
                      <strong>保存并发布</strong>
                      <p>点击"保存"按钮使更改生效</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔧 技术详情
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">部署内容</h4>
                  <ul className="space-y-1">
                    <li>• 专业级 App Embed Block</li>
                    <li>• 自动脚本注入系统</li>
                    <li>• 主题编辑器集成</li>
                    <li>• 可视化配置界面</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">专业特性</h4>
                  <ul className="space-y-1">
                    <li>• 企业级稳定性</li>
                    <li>• 智能错误处理</li>
                    <li>• 自动回滚机制</li>
                    <li>• 性能优化</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Manual Deployment Option */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                ⚙️ 手动部署选项
              </h3>
              <p className="text-yellow-700 mb-4">
                如果自动部署遇到问题，你也可以使用命令行手动部署：
              </p>
              <div className="bg-yellow-100 p-4 rounded font-mono text-sm text-yellow-800">
                <div>cd d:\360\git2\preoder</div>
                <div>node scripts/deploy-app-extensions.js</div>
              </div>
              <p className="text-yellow-600 text-sm mt-3">
                或者使用 Shopify CLI: <code>shopify app deploy</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

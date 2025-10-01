import React, { useState } from 'react';
import { useRouter } from 'next/router';

// 简化的图标展示页面，避免复杂的类型问题
export default function IconsPage() {
  const router = useRouter();
  const { shop } = router.query;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">图标展示</h1>
          <p className="text-gray-600">
            PreOrder Pro 项目中的图标资源
          </p>
        </div>

        {/* 现有图标列表 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">现有图标</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
              <div>
                <h3 className="font-medium">BadgePreorder</h3>
                <p className="text-sm text-gray-500">预售徽章</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                <span className="text-yellow-600 text-sm">🔜</span>
              </div>
              <div>
                <h3 className="font-medium">BadgeComingSoon</h3>
                <p className="text-sm text-gray-500">即将上市徽章</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                <span className="text-red-600 text-sm">❌</span>
              </div>
              <div>
                <h3 className="font-medium">BadgeOutOfStock</h3>
                <p className="text-sm text-gray-500">缺货徽章</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <span className="text-green-600 text-sm">📅</span>
              </div>
              <div>
                <h3 className="font-medium">Calendar</h3>
                <p className="text-sm text-gray-500">日历图标</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                <span className="text-purple-600 text-sm">⏰</span>
              </div>
              <div>
                <h3 className="font-medium">Timer</h3>
                <p className="text-sm text-gray-500">计时器图标</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                <span className="text-indigo-600 text-sm">🚚</span>
              </div>
              <div>
                <h3 className="font-medium">Truck</h3>
                <p className="text-sm text-gray-500">配送图标</p>
              </div>
            </div>
          </div>
        </div>

        {/* 使用指南 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">使用指南</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">1. 导入图标组件</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                <code>{`import { BadgePreorder, Timer, Calendar } from '@/components/icons';`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">2. 使用图标</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                <code>{`<BadgePreorder size={24} color="#3b82f6" className="mr-2" />`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">3. 在按钮中使用</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                <code>{`<button className="btn-primary">
  <BadgePreorder size={16} className="mr-2" />
  创建预售
</button>`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* 添加新图标 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            从 iconfont.cn 添加新图标
          </h3>
          
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
              <div>
                <p className="font-medium">访问 iconfont.cn</p>
                <p className="text-sm">搜索并选择合适的图标，下载SVG格式</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
              <div>
                <p className="font-medium">放置SVG文件</p>
                <p className="text-sm">将SVG文件放入 <code className="bg-blue-100 px-1 rounded">public/icons/</code> 目录</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
              <div>
                <p className="font-medium">生成React组件</p>
                <p className="text-sm">运行命令: <code className="bg-blue-100 px-1 rounded">npm run icons:process</code></p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
              <div>
                <p className="font-medium">使用新图标</p>
                <p className="text-sm">新的React组件将自动生成在 <code className="bg-blue-100 px-1 rounded">components/icons/</code> 目录</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>提示:</strong> 选择图标时建议保持风格一致，优先选择线性图标以匹配项目整体设计风格。
            </p>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}

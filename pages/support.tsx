import React from 'react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">支持中心</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">常见问题</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">如何设置预订功能？</h3>
                  <p className="text-gray-600 mt-2">请参考我们的设置指南...</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">如何管理库存通知？</h3>
                  <p className="text-gray-600 mt-2">在产品管理页面可以设置...</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">联系我们</h2>
              <p className="text-gray-700">
                如需帮助，请发送邮件至：support@preorderpro.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

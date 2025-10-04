import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">隐私政策</h1>
            <p className="text-gray-600">最后更新日期：2024年1月1日</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 信息收集</h2>
              <p className="text-gray-700 mb-3">我们收集以下类型的信息：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>您在使用我们的应用时提供的信息</li>
                <li>自动收集的使用信息和设备信息</li>
                <li>来自第三方服务的信息</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 信息使用</h2>
              <p className="text-gray-700 mb-3">我们使用收集的信息用于：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>提供和维护我们的服务</li>
                <li>改进我们的应用功能</li>
                <li>与您沟通服务相关事宜</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 联系我们</h2>
              <p className="text-gray-700">
                如果您对此隐私政策有任何问题，请通过邮箱联系我们：privacy@preorderpro.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

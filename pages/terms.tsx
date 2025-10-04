import React from 'react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">服务条款</h1>
            <p className="text-gray-600">最后更新日期：2024年1月1日</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 服务条款</h2>
              <p className="text-gray-700">
                通过使用我们的服务，您同意遵守这些条款和条件。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 使用许可</h2>
              <p className="text-gray-700">
                我们授予您有限的、非独占的、不可转让的许可来使用我们的服务。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 联系我们</h2>
              <p className="text-gray-700">
                如果您对这些条款有任何问题，请联系我们：terms@preorderpro.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

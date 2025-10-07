import React from 'react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> August 2025
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-6">
              This Privacy Policy explains how our Shopify app ("the App", "we", "us", or "our") collects, uses, and protects personal information from users who install or use the App through their Shopify store.
            </p>
            <p className="text-gray-700 mb-6">
              By installing or using the App, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              When you install the App, we automatically gain access to certain data from your Shopify store through Shopify's API, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Store information (store name, email, domain, and plan)</li>
              <li>Access tokens required to make API calls on your behalf</li>
            </ul>
            <p className="text-gray-700 mb-4">
              If the App requires access to protected customer data (such as customer names, emails, or order details), such access is strictly limited to the purpose of providing the App's core functionality.
            </p>
            <p className="text-gray-700 mb-6">
              We do not collect, store, or share any personal customer data unless explicitly required for the app's operation.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use the Information</h2>
            <p className="text-gray-700 mb-4">
              We use the data solely for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Authenticating your store and connecting it to our App</li>
              <li>Displaying relevant data and analytics within your dashboard</li>
              <li>Improving app performance and user experience</li>
              <li>Providing customer support</li>
            </ul>
            <p className="text-gray-700 mb-6">
              We do not sell or rent your information to any third parties.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Data Retention and Deletion</h2>
            <p className="text-gray-700 mb-4">
              We retain data only as long as necessary to operate the App.
            </p>
            <p className="text-gray-700 mb-4">
              When you uninstall the App:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Your store access tokens are immediately revoked.</li>
              <li>All associated data is automatically deleted from our servers within 30 days.</li>
            </ul>
            <p className="text-gray-700 mb-6">
              If you want your data deleted earlier, please contact us at the email below.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Disclosure and Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              We may use secure third-party hosting or analytics providers (e.g., Vercel, Supabase, or AWS) that process data solely on our behalf and in compliance with data protection laws.
            </p>
            <p className="text-gray-700 mb-6">
              We do not disclose any store or customer data to unrelated third parties.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Security</h2>
            <p className="text-gray-700 mb-6">
              We follow Shopify's security best practices, including HTTPS/TLS encryption and HMAC signature verification for all API and webhook communications.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              If you are a Shopify merchant or a customer of a Shopify store using our App, you can request:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Access to your data</li>
              <li>Correction or deletion of your data</li>
            </ul>
            <p className="text-gray-700 mb-6">
              To make such requests, please contact us using the information below.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> arinoach@gmail.com
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> 3/F, 230 Ki Lung Street, Sham Shui Po, Kowloon, Hong Kong
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  CogIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function EmailSettingsPage() {
  const router = useRouter()
  const { shop } = router.query
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          email: testEmail
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ type: 'success', text: result.message })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send test email' 
      })
    } finally {
      setTesting(false)
    }
  }

  const handleProcessNotifications = async () => {
    setProcessing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ type: 'success', text: result.message })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process notifications')
      }
    } catch (error) {
      console.error('Error processing notifications:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to process notifications' 
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Layout title="Email Settings - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
        <p className="text-gray-600">Configure and test your email notification system</p>
      </div>

      {message && (
        <div className={`mb-6 rounded-md p-4 ${
          message.type === 'success' ? 'bg-success-50 text-success-800' : 'bg-error-50 text-error-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckIcon className="h-5 w-5 text-success-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-error-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Configuration Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              Email Configuration
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Service</h3>
                  <p className="text-sm text-gray-500">Brevo (Sendinblue) API</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">API Key</h3>
                  <p className="text-sm text-gray-500">xkeysib-922c...gWKx</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Configured
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sender Email</h3>
                  <p className="text-sm text-gray-500">noreply@preorderpro.com</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Ready
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Template Processing</h3>
                  <p className="text-sm text-gray-500">Variable replacement enabled</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Ready
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Email Features Available
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Back-in-stock notifications</li>
                      <li>Pre-order confirmations</li>
                      <li>Payment reminders</li>
                      <li>Delivery updates</li>
                      <li>Custom email templates</li>
                      <li>Automatic retry on failure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test & Management */}
        <div className="space-y-6">
          {/* Test Email */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Test Email</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Send a test email to verify your email configuration is working correctly.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="test-email" className="block text-sm font-medium text-gray-700">
                    Test Email Address
                  </label>
                  <input
                    type="email"
                    id="test-email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="mt-1 form-input"
                    placeholder="your-email@example.com"
                  />
                </div>
                
                <button
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>{testing ? 'Sending...' : 'Send Test Email'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Process Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Notification Queue</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Manually process pending email notifications in the queue.
              </p>
              
              <button
                onClick={handleProcessNotifications}
                disabled={processing}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <PlayIcon className="h-4 w-4" />
                <span>{processing ? 'Processing...' : 'Process Pending Notifications'}</span>
              </button>
            </div>
          </div>

          {/* Email Statistics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Email Statistics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">--</div>
                  <div className="text-sm text-gray-500">Emails Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">--</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">--</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">--</div>
                  <div className="text-sm text-gray-500">Retries</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Statistics will be available after processing notifications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Templates Link */}
      <div className="mt-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
              <p className="text-sm text-gray-600">
                Customize the email templates sent to your customers
              </p>
            </div>
            <a
              href={`/email-templates?shop=${shop}`}
              className="btn-primary"
            >
              Manage Templates
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}

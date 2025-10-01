import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { Switch } from '@headlessui/react'
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface EmailTemplate {
  id: string
  template_type: 'back_in_stock' | 'preorder_confirmation' | 'payment_reminder' | 'delivery_update'
  subject: string
  html_content: string
  text_content: string
  active: boolean
  created_at: string
  updated_at: string
}

const TEMPLATE_TYPES = [
  {
    type: 'back_in_stock',
    name: 'Back in Stock',
    description: 'Sent when a product comes back in stock',
    icon: '🎉'
  },
  {
    type: 'preorder_confirmation',
    name: 'Pre-order Confirmation',
    description: 'Sent when a customer places a pre-order',
    icon: '✅'
  },
  {
    type: 'payment_reminder',
    name: 'Payment Reminder',
    description: 'Sent for partial payment reminders',
    icon: '💳'
  },
  {
    type: 'delivery_update',
    name: 'Delivery Update',
    description: 'Sent when delivery information changes',
    icon: '📦'
  }
]

export default function EmailTemplatesPage() {
  const router = useRouter()
  const { shop } = router.query
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)

  useEffect(() => {
    if (shop) {
      fetchTemplates()
    }
  }, [shop])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/email-templates?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (template: EmailTemplate) => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/email-templates?shop=${shop}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        const updatedTemplate = await response.json()
        setTemplates(prev => 
          prev.map(t => t.template_type === template.template_type ? updatedTemplate : t)
        )
        setEditingTemplate(null)
        setMessage({ type: 'success', text: 'Template saved successfully!' })
      } else {
        throw new Error('Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      setMessage({ type: 'error', text: 'Failed to save template' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (templateType: string, active: boolean) => {
    try {
      const response = await fetch(`/api/email-templates?shop=${shop}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_type: templateType,
          active
        })
      })

      if (response.ok) {
        setTemplates(prev => 
          prev.map(t => t.template_type === templateType ? { ...t, active } : t)
        )
      }
    } catch (error) {
      console.error('Error toggling template:', error)
    }
  }

  const getTemplateByType = (type: string): EmailTemplate | undefined => {
    return templates.find(t => t.template_type === type)
  }

  if (loading) {
    return (
      <Layout title="Email Templates - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Email Templates - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600">Customize email notifications sent to your customers</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATE_TYPES.map((templateType) => {
          const template = getTemplateByType(templateType.type)
          
          return (
            <div key={templateType.type} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{templateType.icon}</div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {templateType.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {templateType.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={template?.active ?? false}
                    onChange={(active) => handleToggleActive(templateType.type, active)}
                    className={`${
                      template?.active ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        template?.active ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </Switch>
                </div>

                {template && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Subject:</strong> {template.subject}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="btn-secondary text-sm flex items-center space-x-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="btn-secondary text-sm flex items-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                )}

                {!template && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-3">
                      Using default template
                    </p>
                    <button
                      onClick={() => setEditingTemplate({
                        id: '',
                        template_type: templateType.type as any,
                        subject: '',
                        html_content: '',
                        text_content: '',
                        active: true,
                        created_at: '',
                        updated_at: ''
                      })}
                      className="btn-primary text-sm"
                    >
                      Customize Template
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit {TEMPLATE_TYPES.find(t => t.type === editingTemplate.template_type)?.name} Template
                </h3>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value
                    })}
                    className="mt-1 form-input"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    HTML Content
                  </label>
                  <textarea
                    rows={12}
                    value={editingTemplate.html_content}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      html_content: e.target.value
                    })}
                    className="mt-1 form-textarea font-mono text-sm"
                    placeholder="Enter HTML content..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use variables like {{customer_name}}, {{product_title}}, {{delivery_date}}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plain Text Content
                  </label>
                  <textarea
                    rows={8}
                    value={editingTemplate.text_content}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      text_content: e.target.value
                    })}
                    className="mt-1 form-textarea"
                    placeholder="Enter plain text version..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveTemplate(editingTemplate)}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Template Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Preview: {TEMPLATE_TYPES.find(t => t.type === previewTemplate.template_type)?.name}
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="text-sm">
                    <strong>Subject:</strong> {previewTemplate.subject}
                  </div>
                </div>
                <div className="p-4 bg-white max-h-96 overflow-y-auto">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: previewTemplate.html_content 
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

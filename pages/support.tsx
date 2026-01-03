import React, { useState } from 'react'

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I enable pre-orders for my products?",
      answer: "To enable pre-orders: 1) Go to the Products page in the app dashboard. 2) Find the product you want to enable pre-orders for. 3) Click the 'Enable Pre-Order' button. 4) The app will automatically update the product's inventory policy and add the necessary metafields. Your customers will now see a 'Pre-Order Now' button instead of 'Add to Cart' when the product is out of stock."
    },
    {
      question: "What payment modes are supported?",
      answer: "PreOrder Pro supports three payment modes: 1) Immediate Payment - Customers pay immediately when placing a pre-order. 2) Pay Later - Customers reserve the item and receive a payment link via email to pay later. 3) Deposit Mode - Customers pay a partial amount upfront and the remainder later. You can configure different payment modes for different campaigns."
    },
    {
      question: "How do pre-order notifications work?",
      answer: "When you enable pre-orders, the app automatically sends email notifications to customers at key stages: 1) Pre-order confirmation email when they place the order. 2) Payment reminder emails (for Pay Later mode). 3) Shipping notification when the product is ready to ship. You can customize these email templates in the Settings > Email Templates section."
    },
    {
      question: "Can I set a maximum quantity for pre-orders?",
      answer: "Yes! When creating or editing a pre-order campaign, you can set a maximum pre-order quantity. Once this limit is reached, the app will automatically disable pre-orders for that product and revert to the normal 'Sold Out' status. This helps you manage inventory and customer expectations."
    },
    {
      question: "How do I track my pre-order sales?",
      answer: "You can track pre-order sales in multiple ways: 1) Dashboard - View real-time statistics on total pre-orders, revenue, and pending payments. 2) Orders Page - See a detailed list of all pre-order transactions. 3) Analytics - Access charts and reports showing pre-order trends over time. All pre-orders are also visible in your Shopify admin panel with appropriate tags."
    },
    {
      question: "What happens when a pre-ordered product comes back in stock?",
      answer: "When a product is restocked: 1) The app automatically detects the inventory change via webhooks. 2) If 'Auto-disable on restock' is enabled, pre-orders will be automatically disabled. 3) Customers who pre-ordered will receive a notification that their order is ready to ship. 4) The product reverts to normal 'Add to Cart' functionality for new customers."
    },
    {
      question: "Can I customize the pre-order button text and styling?",
      answer: "Yes! You can customize the pre-order button in Settings > Frontend Settings: 1) Button Text - Change the text to match your brand (e.g., 'Reserve Now', 'Coming Soon'). 2) Button Colors - Customize the background and text colors. 3) Badge Text - Modify the 'Pre-Order' badge that appears on product images. 4) Multi-language Support - Add translations for different languages."
    },
    {
      question: "How does the Pay Later mode work?",
      answer: "Pay Later mode allows customers to reserve items without immediate payment: 1) Customer places a pre-order without paying. 2) A Draft Order is created in Shopify. 3) Customer receives an email with a payment link. 4) You can set an auto-cancel period (e.g., 7 days). 5) Automatic payment reminders are sent before the deadline. 6) If unpaid after the deadline, the order is automatically cancelled and inventory is released."
    },
    {
      question: "Is my customer data secure?",
      answer: "Absolutely. PreOrder Pro follows industry-standard security practices: 1) All data is encrypted in transit using HTTPS/TLS. 2) We use Shopify's OAuth for secure authentication. 3) All webhooks are verified using HMAC signatures. 4) Customer data is stored securely in compliance with GDPR. 5) We never share your data with third parties. 6) When you uninstall the app, all data is deleted within 30 days."
    },
    {
      question: "Can I offer discounts on pre-orders?",
      answer: "Yes! You can offer pre-order discounts in several ways: 1) Create Shopify discount codes specifically for pre-order products. 2) Use Shopify's automatic discounts feature. 3) Set special pricing for pre-order variants. 4) The discount codes will work seamlessly with both immediate payment and pay later modes."
    },
    {
      question: "What if I need to cancel a pre-order?",
      answer: "You can cancel pre-orders from the Orders page: 1) Find the pre-order you want to cancel. 2) Click 'Cancel Order'. 3) For paid orders, you'll need to issue a refund through Shopify. 4) For Pay Later orders, the Draft Order will be cancelled automatically. 5) The customer will receive a cancellation notification email. 6) Inventory will be released back to available stock."
    },
    {
      question: "Does the app work with all Shopify themes?",
      answer: "PreOrder Pro is designed to work with all Shopify themes: 1) We use universal JavaScript that adapts to different theme structures. 2) The app automatically detects 'Add to Cart' buttons and sold-out states. 3) For optimal compatibility, we recommend using Shopify 2.0 themes. 4) If you experience any theme compatibility issues, contact our support team and we'll help you configure it."
    },
    {
      question: "How do I uninstall the app?",
      answer: "To uninstall PreOrder Pro: 1) Go to your Shopify Admin > Apps. 2) Find PreOrder Pro and click 'Delete'. 3) Confirm the uninstallation. 4) All pre-order buttons will be automatically removed from your store. 5) Your data will be retained for 30 days in case you want to reinstall. 6) After 30 days, all data is permanently deleted. Note: Active pre-orders will remain in your Shopify orders."
    },
    {
      question: "What are the pricing plans?",
      answer: "PreOrder Pro offers flexible pricing plans: 1) Free Plan - Up to 10 pre-orders per month, basic features. 2) Starter Plan - Up to 100 pre-orders/month, email notifications, basic analytics. 3) Professional Plan - Unlimited pre-orders, all payment modes, advanced analytics, priority support. 4) Enterprise Plan - Custom solutions for high-volume stores. Visit our pricing page for current rates and features."
    },
    {
      question: "How quickly can I get support?",
      answer: "We offer multiple support channels: 1) Email Support - Response within 24 hours on business days. 2) WhatsApp Support - For urgent issues, contact us on WhatsApp for faster response. 3) Documentation - Comprehensive guides and tutorials available 24/7. 4) Priority Support - Professional and Enterprise plan customers get priority response within 4 hours."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-lg text-gray-600">
            Get help with PreOrder Pro - Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-3">
                  Send us an email and we'll respond within 24 hours on business days.
                </p>
                <a
                  href="mailto:arinoach@gmail.com"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  arinoach@gmail.com
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  Response time: Within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Support */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Support</h3>
                <p className="text-gray-600 mb-3">
                  For urgent issues, message us on WhatsApp for faster response.
                </p>
                <a
                  href="https://wa.me/447894436676"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  +44 7894 436676
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  Response time: Within 4 hours (business hours)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-12">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Support Hours: Monday - Friday, 9:00 AM - 6:00 PM (HKT/GMT+8)
              </p>
              <p className="text-sm text-blue-700 mt-1">
                We typically respond to emails within 24 hours on business days. For urgent matters, please use WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive guides and tutorials
              </p>
              <a href="/docs" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View Docs →
              </a>
            </div>

            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600 mb-3">
                Step-by-step video guides
              </p>
              <a href="/tutorials" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                Watch Videos →
              </a>
            </div>

            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Setup Guide</h3>
              <p className="text-sm text-gray-600 mb-3">
                Quick start installation guide
              </p>
              <a href="/setup" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                Get Started →
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help.
            Reach out via email or WhatsApp and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:arinoach@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </a>
            <a
              href="https://wa.me/447894436676"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-150"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

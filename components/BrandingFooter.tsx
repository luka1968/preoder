import React, { useState, useEffect } from 'react'
import { UsageMiddleware } from '../lib/usage-middleware'

interface BrandingFooterProps {
  shop: string
  className?: string
}

export default function BrandingFooter({ shop, className = '' }: BrandingFooterProps) {
  const [showBranding, setShowBranding] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkBrandingSettings()
  }, [shop])

  const checkBrandingSettings = async () => {
    try {
      const shouldShow = await UsageMiddleware.shouldShowBranding(shop)
      setShowBranding(shouldShow)
    } catch (error) {
      console.error('Error checking branding settings:', error)
      // Default to showing branding on error
      setShowBranding(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null // Don't show anything while loading
  }

  if (!showBranding) {
    return null // Don't show branding for Pro users
  }

  return (
    <div className={`text-center py-2 text-xs text-gray-500 ${className}`}>
      <span>Powered by </span>
      <a 
        href="https://preorderpro.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        PreOrder Pro
      </a>
    </div>
  )
}

// Widget branding for frontend
export const WidgetBranding = {
  // Check if branding should be shown
  async shouldShow(shop: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/billing/branding?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        return data.showBranding
      }
    } catch (error) {
      console.error('Error checking branding:', error)
    }
    return true // Default to showing branding
  },

  // Generate branding HTML
  generateHTML(): string {
    return `
      <div style="text-align: center; padding: 8px 0; font-size: 11px; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <span>Powered by </span>
        <a href="https://preorderpro.app" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none; font-weight: 500;">
          PreOrder Pro
        </a>
      </div>
    `
  },

  // Inject branding into widget
  inject(containerId: string): void {
    const container = document.getElementById(containerId)
    if (container) {
      const brandingDiv = document.createElement('div')
      brandingDiv.innerHTML = this.generateHTML()
      container.appendChild(brandingDiv)
    }
  }
}

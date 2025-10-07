import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import createApp from '@shopify/app-bridge'
import { Provider } from '@shopify/app-bridge-react'
import { AppProvider } from '@shopify/polaris'

interface AppBridgeProviderProps {
  children: React.ReactNode
}

export default function AppBridgeProvider({ children }: AppBridgeProviderProps) {
  const router = useRouter()
  const [app, setApp] = useState<any>(null)

  useEffect(() => {
    // 从URL参数获取shop和host信息
    const { shop, host } = router.query
    
    if (shop && typeof shop === 'string') {
      // 创建App Bridge实例
      const appBridge = createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
        host: (host as string) || btoa(`${shop}/admin`),
        forceRedirect: true
      })

      setApp(appBridge)
    }
  }, [router.query])

  if (!app) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Shopify App...</p>
        </div>
      </div>
    )
  }

  return (
    <Provider config={app}>
      <AppProvider
        i18n={{
          Polaris: {
            Avatar: {
              label: 'Avatar',
              labelWithInitials: 'Avatar with initials {initials}',
            },
            ContextualSaveBar: {
              save: 'Save',
              discard: 'Discard',
            },
            TextField: {
              characterCount: '{count} characters',
            },
            TopBar: {
              toggleMenuLabel: 'Toggle menu',
              SearchField: {
                clearButtonLabel: 'Clear',
                search: 'Search',
              },
            },
            Modal: {
              iFrameTitle: 'body markup',
            },
            Frame: {
              skipToContent: 'Skip to content',
              navigationLabel: 'Navigation',
              Navigation: {
                closeMobileNavigationLabel: 'Close navigation',
              },
            },
          },
        }}
      >
        {children}
      </AppProvider>
    </Provider>
  )
}

import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import AppBridgeProvider from '../components/AppBridgeProvider'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Shopify应用初始化
    if (typeof window !== 'undefined') {
      // 检查是否在Shopify Admin中运行
      const isInShopifyAdmin = window.top !== window.self
      
      if (isInShopifyAdmin) {
        // 在Shopify Admin iframe中运行的逻辑
        console.log('Running in Shopify Admin iframe')
      }
    }
  }, [])

  return (
    <AppBridgeProvider>
      <Component {...pageProps} />
    </AppBridgeProvider>
  )
}

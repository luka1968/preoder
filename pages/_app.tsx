import '../styles/globals.css'
import AppBridgeProvider from '../components/AppBridgeProvider'

export default function App({ Component, pageProps }) {
  return (
    <AppBridgeProvider>
      <Component {...pageProps} />
    </AppBridgeProvider>
  )
}

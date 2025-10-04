// Export main library functions (avoiding conflicts)
export * from './auth'
export * from './shopify'
export * from './supabase'
export * from './webhooks'

// Email functions - use specific imports to avoid conflicts
export { 
  sendEmail,
  sendBackInStockNotification,
  sendPreorderConfirmation,
  sendPaymentReminder,
  sendDeliveryUpdate,
  sendBulkBackInStockNotifications,
  validateEmailConfig
} from './email'

// Utils - import directly when needed to avoid conflicts

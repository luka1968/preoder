// Database types
export interface Shop {
  id: string
  shop_domain: string
  access_token: string
  scope: string
  installed_at: string
  updated_at: string
  plan: string
  email?: string
  name?: string
  currency?: string
  timezone?: string
  country_code?: string
  active: boolean
}

export interface PreorderSettings {
  id: string
  shop_id: string
  enabled: boolean
  button_text: string
  badge_text: string
  badge_color: string
  show_estimated_date: boolean
  allow_partial_payment: boolean
  partial_payment_percentage: number
  auto_tag_orders: boolean
  order_tag: string
  created_at: string
  updated_at: string
}

export interface ProductPreorderConfig {
  id: string
  shop_id: string
  product_id: string
  enabled: boolean
  preorder_type: PreorderType
  preorder_start_date?: string
  preorder_end_date?: string
  estimated_delivery_date?: string
  delivery_note?: string
  custom_button_text?: string
  custom_badge_text?: string
  badge_color?: string
  allow_partial_payment: boolean
  partial_payment_percentage: number
  auto_tag_orders: boolean
  order_tag: string
  variants_config: Record<string, VariantConfig>
  created_at: string
  updated_at: string
}

export interface VariantConfig {
  enabled: boolean
  preorder_type?: PreorderType
  preorder_start_date?: string
  preorder_end_date?: string
  estimated_delivery_date?: string
  delivery_note?: string
  custom_button_text?: string
  custom_badge_text?: string
  badge_color?: string
}

export interface BackInStockSubscription {
  id: string
  shop_id: string
  product_id: string
  variant_id?: string
  customer_email: string
  customer_name?: string
  status: SubscriptionStatus
  created_at: string
  updated_at: string
  notified_at?: string
}

export interface PreorderOrder {
  id: string
  shop_id: string
  shopify_order_id: string
  product_id: string
  variant_id?: string
  customer_email: string
  total_amount: string
  paid_amount: string
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  estimated_delivery_date?: string
  order_tags: string[]
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  shop_id: string
  template_type: EmailTemplateType
  subject: string
  html_content: string
  text_content: string
  variables: Record<string, string>
  active: boolean
  created_at: string
  updated_at: string
}

export interface NotificationQueue {
  id: string
  shop_id: string
  template_type: string
  recipient_email: string
  subject: string
  html_content: string
  text_content: string
  status: NotificationStatus
  scheduled_at?: string
  sent_at?: string
  error_message?: string
  retry_count: number
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  shop_id: string
  activity_type: string
  description: string
  metadata: Record<string, any>
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  shop_id: string
  plan_name: string
  plan_price: number
  billing_cycle: BillingCycle
  features: Record<string, any>
  status: PlanStatus
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

// Enums
export type PreorderType = 'out_of_stock' | 'always' | 'coming_soon'
export type SubscriptionStatus = 'active' | 'notified' | 'cancelled'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'
export type FulfillmentStatus = 'pending' | 'fulfilled' | 'cancelled'
export type EmailTemplateType = 'back_in_stock' | 'preorder_confirmation' | 'payment_reminder' | 'delivery_update' | 'partial_payment_created' | 'partial_payment_reminder' | 'deposit_confirmation'
export type NotificationStatus = 'pending' | 'sent' | 'failed'
export type BillingCycle = 'monthly' | 'yearly'
export type PlanStatus = 'active' | 'cancelled' | 'past_due'
export type ProductStatus = 'normal' | 'preorder' | 'coming_soon' | 'out_of_stock'

// Shopify types
export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  vendor: string
  product_type: string
  created_at: string
  updated_at: string
  published_at: string
  status: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  options: ShopifyOption[]
  tags: string
  metafields?: ShopifyMetafield[]
}

export interface ShopifyVariant {
  id: string
  product_id: string
  title: string
  price: string
  sku: string
  position: number
  inventory_policy: string
  compare_at_price: string | null
  fulfillment_service: string
  inventory_management: string | null
  option1: string | null
  option2: string | null
  option3: string | null
  created_at: string
  updated_at: string
  taxable: boolean
  barcode: string | null
  grams: number
  image_id: string | null
  inventory_quantity: number
  weight: number
  weight_unit: string
  inventory_item_id: string
  old_inventory_quantity: number
  requires_shipping: boolean
}

export interface ShopifyImage {
  id: string
  product_id: string
  position: number
  created_at: string
  updated_at: string
  alt: string | null
  width: number
  height: number
  src: string
  variant_ids: string[]
}

export interface ShopifyOption {
  id: string
  product_id: string
  name: string
  position: number
  values: string[]
}

export interface ShopifyOrder {
  id: string
  email: string
  created_at: string
  updated_at: string
  number: number
  note: string | null
  token: string
  gateway: string
  test: boolean
  total_price: string
  subtotal_price: string
  total_weight: number
  total_tax: string
  taxes_included: boolean
  currency: string
  financial_status: string
  confirmed: boolean
  total_discounts: string
  buyer_accepts_marketing: boolean
  name: string
  referring_site: string | null
  landing_site: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  total_price_usd: string
  checkout_token: string | null
  reference: string | null
  user_id: string | null
  location_id: string | null
  source_identifier: string | null
  source_url: string | null
  processed_at: string
  device_id: string | null
  phone: string | null
  customer_locale: string | null
  app_id: number
  browser_ip: string | null
  landing_site_ref: string | null
  order_number: number
  discount_applications: any[]
  discount_codes: any[]
  note_attributes: any[]
  payment_gateway_names: string[]
  processing_method: string
  checkout_id: string | null
  source_name: string
  fulfillment_status: string | null
  tax_lines: any[]
  tags: string
  contact_email: string
  order_status_url: string
  presentment_currency: string
  total_line_items_price_set: any
  total_discounts_set: any
  total_shipping_price_set: any
  subtotal_price_set: any
  total_price_set: any
  total_tax_set: any
  line_items: ShopifyLineItem[]
  customer: ShopifyCustomer | null
}

export interface ShopifyLineItem {
  id: string
  variant_id: string
  title: string
  quantity: number
  sku: string
  variant_title: string | null
  vendor: string
  fulfillment_service: string
  product_id: string
  requires_shipping: boolean
  taxable: boolean
  gift_card: boolean
  name: string
  variant_inventory_management: string | null
  properties: ShopifyLineItemProperty[]
  product_exists: boolean
  fulfillable_quantity: number
  grams: number
  price: string
  total_discount: string
  fulfillment_status: string | null
  price_set: any
  total_discount_set: any
  discount_allocations: any[]
  duties: any[]
  admin_graphql_api_id: string
  tax_lines: any[]
}

export interface ShopifyLineItemProperty {
  name: string
  value: string
}

export interface ShopifyCustomer {
  id: string
  email: string
  accepts_marketing: boolean
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  orders_count: number
  state: string
  total_spent: string
  last_order_id: string | null
  note: string | null
  verified_email: boolean
  multipass_identifier: string | null
  tax_exempt: boolean
  phone: string | null
  tags: string
  last_order_name: string | null
  currency: string
  addresses: ShopifyAddress[]
  accepts_marketing_updated_at: string
  marketing_opt_in_level: string | null
  tax_exemptions: any[]
  admin_graphql_api_id: string
  default_address: ShopifyAddress | null
}

export interface ShopifyAddress {
  id: string
  customer_id: string
  first_name: string
  last_name: string
  company: string | null
  address1: string
  address2: string | null
  city: string
  province: string
  country: string
  zip: string
  phone: string | null
  name: string
  province_code: string
  country_code: string
  country_name: string
  default: boolean
}

export interface ShopifyMetafield {
  id: string
  namespace: string
  key: string
  value: string
  value_type: string
  description: string | null
  owner_id: string
  owner_resource: string
  created_at: string
  updated_at: string
}

export interface ShopifyWebhook {
  id: string
  address: string
  topic: string
  created_at: string
  updated_at: string
  format: string
  fields: string[]
  metafield_namespaces: string[]
  private_metafield_namespaces: string[]
  api_version: string
}

// API types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface DashboardStats {
  totalPreorders: number
  activeNotifications: number
  totalRevenue: number
  subscribers: number
  pendingPayments: number
  upcomingDeliveries: number
}

export interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
}

// Form types
export interface PreorderConfigForm {
  enabled: boolean
  preorder_type: PreorderType
  preorder_start_date?: string
  preorder_end_date?: string
  estimated_delivery_date?: string
  delivery_note?: string
  custom_button_text?: string
  custom_badge_text?: string
  badge_color?: string
  allow_partial_payment: boolean
  partial_payment_percentage: number
  auto_tag_orders: boolean
  order_tag: string
  variants_config: Record<string, VariantConfig>
}

export interface BackInStockSubscriptionForm {
  email: string
  name?: string
  product_id: string
  variant_id?: string
}

export interface EmailTemplateForm {
  template_type: EmailTemplateType
  subject: string
  html_content: string
  text_content: string
  active: boolean
}

// Widget types
export interface WidgetConfig {
  apiUrl: string
  shop: string
  debug: boolean
  retryAttempts: number
  retryDelay: number
}

export interface WidgetState {
  productId: string | null
  variantId: string | null
  config: ProductPreorderConfig | null
  status: ProductStatus
  inventoryStatus: InventoryStatus
}

export interface InventoryStatus {
  outOfStock: boolean
  totalInventory: number
  availableVariants: number
  totalVariants: number
}

// Email template variables
export interface EmailVariables {
  shop_name?: string
  customer_name?: string
  customer_email?: string
  product_title?: string
  product_url?: string
  variant_title?: string
  order_number?: string
  order_url?: string
  delivery_date?: string
  delivery_note?: string
  unsubscribe_url?: string
  [key: string]: string | undefined
}

// Authentication types
export interface JWTPayload {
  shop: string
  shopId: string
  iat?: number
  exp?: number
}

export interface SessionData {
  shop: string
  shopId: string
  accessToken: string
  scope: string
  expiresAt?: number
}

// Error types
export interface AppError {
  message: string
  code: string
  statusCode: number
  details?: any
}

// Webhook payload types
export interface ProductUpdateWebhook {
  id: string
  title: string
  handle: string
  vendor: string
  product_type: string
  created_at: string
  updated_at: string
  published_at: string
  status: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  options: ShopifyOption[]
  tags: string
}

export interface OrderCreateWebhook extends ShopifyOrder {}

export interface OrderUpdateWebhook extends ShopifyOrder {}

export interface AppUninstalledWebhook {
  id: string
  name: string
  email: string
  domain: string
  province: string
  country: string
  address1: string
  zip: string
  city: string
  source: string
  phone: string
  latitude: number
  longitude: number
  primary_location_id: string
  primary_locale: string
  address2: string
  created_at: string
  updated_at: string
  country_code: string
  country_name: string
  currency: string
  customer_email: string
  timezone: string
  iana_timezone: string
  shop_owner: string
  money_format: string
  money_with_currency_format: string
  weight_unit: string
  province_code: string
  taxes_included: boolean
  auto_configure_tax_inclusivity: boolean
  tax_shipping: boolean
  county_taxes: boolean
  plan_display_name: string
  plan_name: string
  has_discounts: boolean
  has_gift_cards: boolean
  myshopify_domain: string
  google_apps_domain: string
  google_apps_login_enabled: boolean
  money_in_emails_format: string
  money_with_currency_in_emails_format: string
  eligible_for_payments: boolean
  requires_extra_payments_agreement: boolean
  password_enabled: boolean
  has_storefront: boolean
  eligible_for_card_reader_giveaway: boolean
  finances: boolean
  primary_location: any
  cookie_consent_level: string
  visitor_tracking_consent_preference: string
  checkout_api_supported: boolean
  multi_location_enabled: boolean
  setup_required: boolean
  pre_launch_enabled: boolean
  enabled_presentment_currencies: string[]
}

// Component props types
export interface LayoutProps {
  children: any
  title?: string
  shop: string
}

export interface BadgeProps {
  text: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
}

export interface ButtonProps {
  children: any
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: any
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
}

export interface TableColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, row: T) => any
  width?: string
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

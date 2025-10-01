import { 
  createDraftOrder, 
  sendDraftOrderInvoice, 
  getDraftOrder, 
  completeDraftOrder,
  createRefund,
  DraftOrderLineItem,
  CreateDraftOrderData 
} from './shopify'
import { supabaseAdmin, getShopByDomain } from './supabase'
import { sendTemplatedEmail } from './brevo-email'

export interface PartialPaymentConfig {
  enabled: boolean
  default_percentage: number
  minimum_deposit: number
  maximum_deposit: number
  payment_terms_days: number
  auto_charge_remaining: boolean
  send_payment_reminders: boolean
  reminder_days_before: number[]
  late_fee_enabled: boolean
  late_fee_percentage: number
  grace_period_days: number
}

export interface PartialPaymentOrder {
  id: string
  shop_id: string
  original_order_id?: string
  customer_email: string
  customer_name?: string
  product_id: string
  variant_id?: string
  product_title: string
  variant_title?: string
  total_amount: string
  deposit_percentage: number
  deposit_amount: string
  remaining_amount: string
  
  // Draft Orders
  deposit_draft_order_id?: number
  remaining_draft_order_id?: number
  
  // Shopify Orders (after payment)
  deposit_order_id?: number
  remaining_order_id?: number
  
  // Payment Status
  deposit_paid: boolean
  remaining_paid: boolean
  deposit_paid_at?: string
  remaining_paid_at?: string
  
  // Timeline
  due_date: string
  created_at: string
  updated_at: string
  
  // Status
  status: 'pending_deposit' | 'deposit_paid' | 'completed' | 'cancelled' | 'refunded'
  
  // Shipping
  shipping_address?: any
  billing_address?: any
  
  // Notes
  notes?: string
  tags?: string[]
}

/**
 * 创建部分付款订单 - 使用 Shopify Draft Order 实现
 */
export async function createPartialPaymentOrder(
  shopDomain: string,
  orderData: {
    customer_email: string
    customer_name?: string
    product_id: string
    variant_id?: string
    product_title: string
    variant_title?: string
    quantity: number
    unit_price: string
    deposit_percentage?: number
    shipping_address?: any
    billing_address?: any
    notes?: string
  }
): Promise<PartialPaymentOrder> {
  const shop = await getShopByDomain(shopDomain)
  if (!shop) {
    throw new Error('Shop not found')
  }

  // 获取部分付款配置
  const { data: config } = await supabaseAdmin
    .from('partial_payment_settings')
    .select('*')
    .eq('shop_id', shop.id)
    .single()

  if (!config?.enabled) {
    throw new Error('Partial payments not enabled for this shop')
  }

  const depositPercentage = orderData.deposit_percentage || config.default_percentage
  const totalAmount = parseFloat(orderData.unit_price) * orderData.quantity
  const depositAmount = (totalAmount * depositPercentage) / 100
  const remainingAmount = totalAmount - depositAmount

  // 计算到期日期
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + config.payment_terms_days)

  // 1. 创建定金 Draft Order
  const depositLineItems: DraftOrderLineItem[] = [{
    variant_id: orderData.variant_id ? parseInt(orderData.variant_id) : undefined,
    product_id: parseInt(orderData.product_id),
    quantity: orderData.quantity,
    price: (depositAmount / orderData.quantity).toFixed(2),
    title: `${orderData.product_title} - 定金 (${depositPercentage}%)`,
    properties: [
      { name: 'Payment Type', value: 'Deposit' },
      { name: 'Deposit Percentage', value: `${depositPercentage}%` },
      { name: 'Total Amount', value: totalAmount.toFixed(2) },
      { name: 'Remaining Amount', value: remainingAmount.toFixed(2) }
    ]
  }]

  const depositDraftOrderData: CreateDraftOrderData = {
    line_items: depositLineItems,
    customer: {
      email: orderData.customer_email,
      first_name: orderData.customer_name?.split(' ')[0],
      last_name: orderData.customer_name?.split(' ').slice(1).join(' ')
    },
    email: orderData.customer_email,
    note: `预售定金订单 - ${depositPercentage}% 定金\n${orderData.notes || ''}`,
    tags: 'preorder,deposit,partial-payment',
    shipping_address: orderData.shipping_address,
    billing_address: orderData.billing_address
  }

  const depositDraftOrder = await createDraftOrder(
    shopDomain, 
    shop.access_token, 
    depositDraftOrderData
  )

  // 2. 创建尾款 Draft Order (但不立即发送)
  const remainingLineItems: DraftOrderLineItem[] = [{
    variant_id: orderData.variant_id ? parseInt(orderData.variant_id) : undefined,
    product_id: parseInt(orderData.product_id),
    quantity: orderData.quantity,
    price: (remainingAmount / orderData.quantity).toFixed(2),
    title: `${orderData.product_title} - 尾款 (${100 - depositPercentage}%)`,
    properties: [
      { name: 'Payment Type', value: 'Final Payment' },
      { name: 'Original Total', value: totalAmount.toFixed(2) },
      { name: 'Deposit Amount', value: depositAmount.toFixed(2) },
      { name: 'Due Date', value: dueDate.toISOString().split('T')[0] }
    ]
  }]

  const remainingDraftOrderData: CreateDraftOrderData = {
    line_items: remainingLineItems,
    customer: {
      email: orderData.customer_email,
      first_name: orderData.customer_name?.split(' ')[0],
      last_name: orderData.customer_name?.split(' ').slice(1).join(' ')
    },
    email: orderData.customer_email,
    note: `预售尾款订单 - ${100 - depositPercentage}% 尾款\n到期日期: ${dueDate.toLocaleDateString()}\n${orderData.notes || ''}`,
    tags: 'preorder,final-payment,partial-payment',
    shipping_address: orderData.shipping_address,
    billing_address: orderData.billing_address
  }

  const remainingDraftOrder = await createDraftOrder(
    shopDomain, 
    shop.access_token, 
    remainingDraftOrderData
  )

  // 3. 保存到数据库
  const partialPaymentOrder: Omit<PartialPaymentOrder, 'id'> = {
    shop_id: shop.id,
    customer_email: orderData.customer_email,
    customer_name: orderData.customer_name,
    product_id: orderData.product_id,
    variant_id: orderData.variant_id,
    product_title: orderData.product_title,
    variant_title: orderData.variant_title,
    total_amount: totalAmount.toFixed(2),
    deposit_percentage: depositPercentage,
    deposit_amount: depositAmount.toFixed(2),
    remaining_amount: remainingAmount.toFixed(2),
    deposit_draft_order_id: depositDraftOrder.id,
    remaining_draft_order_id: remainingDraftOrder.id,
    deposit_paid: false,
    remaining_paid: false,
    due_date: dueDate.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'pending_deposit',
    shipping_address: orderData.shipping_address,
    billing_address: orderData.billing_address,
    notes: orderData.notes,
    tags: ['preorder', 'partial-payment']
  }

  const { data: savedOrder, error } = await supabaseAdmin
    .from('partial_payment_orders')
    .insert(partialPaymentOrder)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save partial payment order: ${error.message}`)
  }

  // 4. 发送定金订单邮件
  await sendDraftOrderInvoice(
    shopDomain,
    shop.access_token,
    depositDraftOrder.id,
    `请支付您的预售定金 (${depositPercentage}%)`
  )

  // 5. 发送确认邮件
  await sendPartialPaymentCreatedEmail(shop.id, savedOrder)

  return savedOrder
}

/**
 * 处理定金支付完成
 */
export async function handleDepositPayment(
  shopDomain: string,
  partialPaymentId: string,
  shopifyOrderId: number
): Promise<void> {
  const shop = await getShopByDomain(shopDomain)
  if (!shop) {
    throw new Error('Shop not found')
  }

  // 更新数据库记录
  const { data: order, error } = await supabaseAdmin
    .from('partial_payment_orders')
    .update({
      deposit_paid: true,
      deposit_paid_at: new Date().toISOString(),
      deposit_order_id: shopifyOrderId,
      status: 'deposit_paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', partialPaymentId)
    .eq('shop_id', shop.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update deposit payment: ${error.message}`)
  }

  // 发送定金确认邮件
  await sendDepositConfirmationEmail(shop.id, order)

  // 检查是否需要自动发送尾款账单
  const { data: config } = await supabaseAdmin
    .from('partial_payment_settings')
    .select('*')
    .eq('shop_id', shop.id)
    .single()

  if (config?.auto_charge_remaining) {
    // 立即发送尾款账单
    await sendFinalPaymentInvoice(shopDomain, partialPaymentId)
  }
}

/**
 * 发送尾款账单
 */
export async function sendFinalPaymentInvoice(
  shopDomain: string,
  partialPaymentId: string
): Promise<void> {
  const shop = await getShopByDomain(shopDomain)
  if (!shop) {
    throw new Error('Shop not found')
  }

  const { data: order, error } = await supabaseAdmin
    .from('partial_payment_orders')
    .select('*')
    .eq('id', partialPaymentId)
    .eq('shop_id', shop.id)
    .single()

  if (error || !order) {
    throw new Error('Partial payment order not found')
  }

  if (!order.deposit_paid) {
    throw new Error('Deposit must be paid before sending final payment invoice')
  }

  if (!order.remaining_draft_order_id) {
    throw new Error('Final payment draft order not found')
  }

  // 发送尾款账单
  await sendDraftOrderInvoice(
    shopDomain,
    shop.access_token,
    order.remaining_draft_order_id,
    `请支付您的预售尾款 - 到期日期: ${new Date(order.due_date).toLocaleDateString()}`
  )

  // 发送提醒邮件
  await sendFinalPaymentReminderEmail(shop.id, order)
}

/**
 * 处理尾款支付完成
 */
export async function handleFinalPayment(
  shopDomain: string,
  partialPaymentId: string,
  shopifyOrderId: number
): Promise<void> {
  const shop = await getShopByDomain(shopDomain)
  if (!shop) {
    throw new Error('Shop not found')
  }

  // 更新数据库记录
  const { data: order, error } = await supabaseAdmin
    .from('partial_payment_orders')
    .update({
      remaining_paid: true,
      remaining_paid_at: new Date().toISOString(),
      remaining_order_id: shopifyOrderId,
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', partialPaymentId)
    .eq('shop_id', shop.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update final payment: ${error.message}`)
  }

  // 发送完成确认邮件
  await sendPaymentCompletedEmail(shop.id, order)
}

/**
 * 取消部分付款订单
 */
export async function cancelPartialPaymentOrder(
  shopDomain: string,
  partialPaymentId: string,
  reason?: string
): Promise<void> {
  const shop = await getShopByDomain(shopDomain)
  if (!shop) {
    throw new Error('Shop not found')
  }

  const { data: order, error } = await supabaseAdmin
    .from('partial_payment_orders')
    .select('*')
    .eq('id', partialPaymentId)
    .eq('shop_id', shop.id)
    .single()

  if (error || !order) {
    throw new Error('Partial payment order not found')
  }

  // 如果定金已支付，需要退款
  if (order.deposit_paid && order.deposit_order_id) {
    await createRefund(
      shopDomain,
      shop.access_token,
      order.deposit_order_id,
      {
        refund: {
          notify: true,
          note: `预售订单取消退款: ${reason || 'Order cancelled'}`,
          refund_line_items: [] // 全额退款
        }
      }
    )
  }

  // 更新状态
  await supabaseAdmin
    .from('partial_payment_orders')
    .update({
      status: 'cancelled',
      notes: `${order.notes || ''}\n取消原因: ${reason || 'Order cancelled'}`,
      updated_at: new Date().toISOString()
    })
    .eq('id', partialPaymentId)

  // 发送取消确认邮件
  await sendOrderCancelledEmail(shop.id, order, reason)
}

// 邮件发送函数
async function sendPartialPaymentCreatedEmail(shopId: string, order: PartialPaymentOrder) {
  try {
    await sendTemplatedEmail(
      shopId,
      'partial_payment_created',
      order.customer_email,
      {
        customer_name: order.customer_name || 'Customer',
        product_title: order.product_title,
        total_amount: order.total_amount,
        deposit_amount: order.deposit_amount,
        deposit_percentage: order.deposit_percentage.toString(),
        remaining_amount: order.remaining_amount,
        due_date: new Date(order.due_date).toLocaleDateString(),
        shop_name: 'Your Store'
      }
    )
  } catch (error) {
    console.error('Error sending partial payment created email:', error)
  }
}

async function sendDepositConfirmationEmail(shopId: string, order: PartialPaymentOrder) {
  try {
    await sendTemplatedEmail(
      shopId,
      'deposit_confirmation',
      order.customer_email,
      {
        customer_name: order.customer_name || 'Customer',
        product_title: order.product_title,
        deposit_amount: order.deposit_amount,
        remaining_amount: order.remaining_amount,
        due_date: new Date(order.due_date).toLocaleDateString(),
        shop_name: 'Your Store'
      }
    )
  } catch (error) {
    console.error('Error sending deposit confirmation email:', error)
  }
}

async function sendFinalPaymentReminderEmail(shopId: string, order: PartialPaymentOrder) {
  try {
    await sendTemplatedEmail(
      shopId,
      'final_payment_reminder',
      order.customer_email,
      {
        customer_name: order.customer_name || 'Customer',
        product_title: order.product_title,
        remaining_amount: order.remaining_amount,
        due_date: new Date(order.due_date).toLocaleDateString(),
        shop_name: 'Your Store'
      }
    )
  } catch (error) {
    console.error('Error sending final payment reminder email:', error)
  }
}

async function sendPaymentCompletedEmail(shopId: string, order: PartialPaymentOrder) {
  try {
    await sendTemplatedEmail(
      shopId,
      'payment_completed',
      order.customer_email,
      {
        customer_name: order.customer_name || 'Customer',
        product_title: order.product_title,
        total_amount: order.total_amount,
        shop_name: 'Your Store'
      }
    )
  } catch (error) {
    console.error('Error sending payment completed email:', error)
  }
}

async function sendOrderCancelledEmail(shopId: string, order: PartialPaymentOrder, reason?: string) {
  try {
    await sendTemplatedEmail(
      shopId,
      'order_cancelled',
      order.customer_email,
      {
        customer_name: order.customer_name || 'Customer',
        product_title: order.product_title,
        reason: reason || 'Order cancelled',
        shop_name: 'Your Store'
      }
    )
  } catch (error) {
    console.error('Error sending order cancelled email:', error)
  }
}

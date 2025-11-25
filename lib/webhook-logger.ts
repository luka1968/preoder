import { supabaseAdmin } from './supabase'

/**
 * Webhook日志记录中间�?
 * 在所有webhook处理器中使用
 */
export async function logWebhookEvent(
    shopId: string,
    topic: string,
    payload: any,
    success: boolean,
    error?: string
) {
    try {
        // 1. 记录到logs�?
        await supabaseAdmin.from('logs').insert({
            shop_id: shopId,
            type: 'inventory_webhook',
            action: topic,
            level: success ? 'info' : 'error',
            payload,
            error_message: error,
            created_at: new Date().toISOString(),
        })

        // 2. 更新webhook_status�?
        const { data: status } = await supabaseAdmin
            .from('webhook_status')
            .select('*')
            .eq('shop_id', shopId)
            .eq('topic', topic)
            .single()

        if (status) {
            await supabaseAdmin
                .from('webhook_status')
                .update({
                    last_received_at: new Date().toISOString(),
                    last_success_at: success ? new Date().toISOString() : status.last_success_at,
                    last_failure_at: !success ? new Date().toISOString() : status.last_failure_at,
                    total_received: (status.total_received || 0) + 1,
                    success_count: success ? (status.success_count || 0) + 1 : status.success_count,
                    failure_count: !success ? (status.failure_count || 0) + 1 : status.failure_count,
                    last_payload: payload,
                    last_error: error || null,
                    is_healthy: success,
                    updated_at: new Date().toISOString(),
                })
                .eq('shop_id', shopId)
                .eq('topic', topic)
        } else {
            // 创建新记�?
            await supabaseAdmin.from('webhook_status').insert({
                shop_id: shopId,
                topic,
                last_received_at: new Date().toISOString(),
                last_success_at: success ? new Date().toISOString() : null,
                last_failure_at: !success ? new Date().toISOString() : null,
                total_received: 1,
                success_count: success ? 1 : 0,
                failure_count: !success ? 1 : 0,
                last_payload: payload,
                last_error: error || null,
                is_healthy: success,
                is_registered: true,
            })
        }
    } catch (err) {
        console.error('Failed to log webhook event:', err)
    }
}

/**
 * 记录操作日志
 */
export async function logAction(
    shopId: string,
    type: string,
    action: string,
    details: {
        variantId?: string
        productId?: string
        message?: string
        level?: 'info' | 'warning' | 'error'
    }
) {
    try {
        await supabaseAdmin.from('logs').insert({
            shop_id: shopId,
            type,
            action,
            level: details.level || 'info',
            variant_id: details.variantId,
            product_id: details.productId,
            message: details.message,
            created_at: new Date().toISOString(),
        })
    } catch (err) {
        console.error('Failed to log action:', err)
    }
}

/**
 * 记录错误
 */
export async function logError(
    shopId: string,
    error: Error,
    context: {
        type?: string
        variantId?: string
        action?: string
    }
) {
    try {
        await supabaseAdmin.from('logs').insert({
            shop_id: shopId,
            type: context.type || 'error',
            action: context.action || 'unknown',
            level: 'error',
            variant_id: context.variantId,
            error_message: error.message,
            stack_trace: error.stack,
            created_at: new Date().toISOString(),
        })
    } catch (err) {
        console.error('Failed to log error:', err)
    }
}

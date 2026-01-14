/**\r\n * Webhook registration utility for Shopify\r\n */

/**
 * 自动注册所有必需的 Webhooks
 */
export async function registerWebhooksForShop(shop: string, accessToken: string): Promise<void> {
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
        console.error('❌ SHOPIFY_APP_URL not configured');
        return;
    }

    const webhooks = [
        {
            topic: 'orders/create',
            address: `${appUrl}/api/webhooks/orders/create`,
            format: 'json'
        },
        {
            topic: 'inventory_levels/update',
            address: `${appUrl}/api/webhooks/inventory/updated`,
            format: 'json'
        },
        {
            topic: 'app/uninstalled',
            address: `${appUrl}/api/webhooks/app/uninstalled`,
            format: 'json'
        },
        // GDPR Privacy Webhooks (mandatory for Shopify app approval)
        {
            topic: 'shop/redact',
            address: `${appUrl}/api/webhooks/privacy/shop-redact`,
            format: 'json'
        },
        {
            topic: 'customers/redact',
            address: `${appUrl}/api/webhooks/privacy/customers-redact`,
            format: 'json'
        },
        {
            topic: 'customers/data_request',
            address: `${appUrl}/api/webhooks/privacy/customers-data_request`,
            format: 'json'
        }
    ];


    for (const webhook of webhooks) {
        try {
            await registerWebhook(shop, accessToken, webhook);
            console.log(`✅ Registered: ${webhook.topic}`);
        } catch (error: any) {
            // 如果webhook已存在，忽略错误
            if (error.message?.includes('already exists')) {
                console.log(`ℹ️  Already registered: ${webhook.topic}`);
            } else {
                console.error(`❌ Failed to register ${webhook.topic}:`, error.message);
            }
        }
    }
}

/**
 * 注册单个 Webhook
 */
async function registerWebhook(
    shop: string,
    accessToken: string,
    webhook: { topic: string; address: string; format: string }
): Promise<void> {
    const response = await fetch(
        `https://${shop}/admin/api/2024-01/webhooks.json`,
        {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ webhook }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.webhook;
}

/**
 * 获取已注册的 Webhooks
 */
export async function getRegisteredWebhooks(
    shop: string,
    accessToken: string
): Promise<any[]> {
    const response = await fetch(
        `https://${shop}/admin/api/2024-01/webhooks.json`,
        {
            headers: {
                'X-Shopify-Access-Token': accessToken,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to get webhooks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.webhooks || [];
}

/**
 * 删除所有应用的 Webhooks（用于清理）
 */
export async function deleteAllAppWebhooks(
    shop: string,
    accessToken: string
): Promise<void> {
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    const webhooks = await getRegisteredWebhooks(shop, accessToken);

    const appWebhooks = webhooks.filter((w) =>
        w.address.includes(appUrl)
    );

    for (const webhook of appWebhooks) {
        try {
            await fetch(
                `https://${shop}/admin/api/2024-01/webhooks/${webhook.id}.json`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                    },
                }
            );
            console.log(`🗑️  Deleted webhook: ${webhook.topic}`);
        } catch (error) {
            console.error(`Failed to delete webhook ${webhook.id}:`, error);
        }
    }
}

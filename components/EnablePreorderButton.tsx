import { useState } from 'react'
import { Card, Button, Toast, Banner, TextField, Stack } from '@shopify/polaris'

/**
 * 一键启用预购功能组�?
 * 商家可以输入产品 ID，自动设�?"Continue selling when out of stock"
 */
export default function EnablePreorderButton({
    shop,
    productId: initialProductId
}: {
    shop: string
    productId?: string
}) {
    const [productId, setProductId] = useState(initialProductId || '')
    const [loading, setLoading] = useState(false)
    const [toastActive, setToastActive] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastError, setToastError] = useState(false)

    const handleEnablePreorder = async () => {
        if (!productId) {
            showToast('请输入产�?ID', true)
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/products/enable-preorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shop: shop,
                    productId: productId
                })
            })

            const result = await response.json()

            if (response.ok && result.success) {
                showToast(`�?成功！已�?${result.results?.length || 1} 个变体启用预购`, false)
            } else {
                showToast(`�?失败�?{result.error || '未知错误'}`, true)
            }
        } catch (error: any) {
            showToast(`�?错误�?{error.message}`, true)
        } finally {
            setLoading(false)
        }
    }

    const showToast = (message: string, isError: boolean) => {
        setToastMessage(message)
        setToastError(isError)
        setToastActive(true)
    }

    const toastMarkup = toastActive ? (
        <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
        />
    ) : null

    return (
        <>
            <Card sectioned>
                <Stack vertical spacing="loose">
                    <Banner status="info">
                        <p>
                            <strong>一键启用预�?🚀</strong>
                        </p>
                        <p>
                            自动设置产品�?"Continue selling when out of stock"�?
                            无需手动�?Shopify 后台修改�?
                        </p>
                    </Banner>

                    <TextField
                        label="产品 ID"
                        value={productId}
                        onChange={setProductId}
                        placeholder="输入产品 ID，例如：123456789"
                        helpText="可以在产品页�?URL 中找到产�?ID"
                        autoComplete="off"
                    />

                    <Button
                        primary
                        loading={loading}
                        onClick={handleEnablePreorder}
                        disabled={!productId}
                    >
                        🎯 一键启用预�?
                    </Button>

                    <Banner status="warning">
                        <p>
                            <strong>注意�?/strong>
                            这将为产品的所有变体设置允许超卖�?
                            如果只想设置特定变体，请�?Shopify Admin 中手动操作�?
                        </p>
                    </Banner>
                </Stack>
            </Card>

            {toastMarkup}
        </>
    )
}

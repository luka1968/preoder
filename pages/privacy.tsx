import React from 'react'
import { Card, Page, Layout, Text, Stack, Divider } from '@shopify/polaris'

export default function PrivacyPolicy() {
  return (
    <Page
      title="隐私政策"
      subtitle="PreOrder Pro 应用隐私政策"
      backAction={{ content: '返回', url: '/' }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Stack vertical spacing="loose">
              <Text variant="headingMd" as="h2">
                隐私政策
              </Text>
              
              <Text variant="bodyMd" as="p">
                最后更新日期：{new Date().toLocaleDateString('zh-CN')}
              </Text>

              <Divider />

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  1. 信息收集
                </Text>
                <Text variant="bodyMd" as="p">
                  PreOrder Pro 应用收集以下信息以提供服务：
                </Text>
                <ul>
                  <li>商店信息：商店名称、域名、联系信息</li>
                  <li>产品数据：产品信息、库存状态、预订设置</li>
                  <li>订单数据：预订单信息、客户联系方式</li>
                  <li>使用数据：应用使用统计、功能偏好设置</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  2. 信息使用
                </Text>
                <Text variant="bodyMd" as="p">
                  我们使用收集的信息用于：
                </Text>
                <ul>
                  <li>提供预订功能和订单管理服务</li>
                  <li>发送预订确认和状态更新邮件</li>
                  <li>改进应用功能和用户体验</li>
                  <li>提供客户支持服务</li>
                  <li>确保应用安全性和防止滥用</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  3. 信息共享
                </Text>
                <Text variant="bodyMd" as="p">
                  我们不会出售、交易或转让您的个人信息给第三方，除非：
                </Text>
                <ul>
                  <li>获得您的明确同意</li>
                  <li>法律要求或法院命令</li>
                  <li>保护我们的权利、财产或安全</li>
                  <li>与可信的第三方服务提供商合作（如邮件服务）</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  4. 数据安全
                </Text>
                <Text variant="bodyMd" as="p">
                  我们采用行业标准的安全措施保护您的数据：
                </Text>
                <ul>
                  <li>SSL/TLS 加密传输</li>
                  <li>数据库加密存储</li>
                  <li>访问控制和身份验证</li>
                  <li>定期安全审计和更新</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  5. 数据保留
                </Text>
                <Text variant="bodyMd" as="p">
                  我们仅在必要期间保留您的数据：
                </Text>
                <ul>
                  <li>应用使用期间：保留所有必要数据</li>
                  <li>卸载应用后：30天内删除所有数据</li>
                  <li>法律要求：按法律规定保留相关记录</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  6. 您的权利
                </Text>
                <Text variant="bodyMd" as="p">
                  您有权：
                </Text>
                <ul>
                  <li>访问我们持有的您的个人数据</li>
                  <li>要求更正不准确的数据</li>
                  <li>要求删除您的个人数据</li>
                  <li>限制或反对数据处理</li>
                  <li>数据可携带性</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  7. Cookies 和追踪
                </Text>
                <Text variant="bodyMd" as="p">
                  我们使用必要的 cookies 来：
                </Text>
                <ul>
                  <li>维护用户会话和身份验证</li>
                  <li>记住用户偏好设置</li>
                  <li>分析应用使用情况（匿名数据）</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  8. 第三方服务
                </Text>
                <Text variant="bodyMd" as="p">
                  我们使用以下第三方服务：
                </Text>
                <ul>
                  <li>Shopify：电商平台集成</li>
                  <li>Supabase：数据库服务</li>
                  <li>Brevo：邮件发送服务</li>
                  <li>Vercel：应用托管服务</li>
                </ul>
                <Text variant="bodyMd" as="p">
                  这些服务都有自己的隐私政策，我们建议您查阅相关政策。
                </Text>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  9. 儿童隐私
                </Text>
                <Text variant="bodyMd" as="p">
                  我们的服务不面向13岁以下儿童。我们不会故意收集13岁以下儿童的个人信息。
                </Text>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  10. 政策更新
                </Text>
                <Text variant="bodyMd" as="p">
                  我们可能会更新此隐私政策。重大更改时，我们会通过应用内通知或邮件告知您。
                </Text>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  11. 联系我们
                </Text>
                <Text variant="bodyMd" as="p">
                  如有隐私相关问题，请联系我们：
                </Text>
                <ul>
                  <li>邮箱：support@shopmall.dpdns.org</li>
                  <li>支持页面：https://shopmall.dpdns.org/support</li>
                  <li>地址：[您的公司地址]</li>
                </ul>
              </Stack>

              <Divider />
              
              <Text variant="bodyMd" as="p" color="subdued">
                本隐私政策符合 GDPR、CCPA 等数据保护法规要求。
              </Text>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

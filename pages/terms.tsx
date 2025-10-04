import React from 'react'
import { Card, Page, Layout, Text, Stack, Divider } from '@shopify/polaris'

export default function TermsOfService() {
  return (
    <Page
      title="服务条款"
      subtitle="PreOrder Pro 应用服务条款"
      backAction={{ content: '返回', url: '/' }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Stack vertical spacing="loose">
              <Text variant="headingMd" as="h2">
                服务条款
              </Text>
              
              <Text variant="bodyMd" as="p">
                最后更新日期：{new Date().toLocaleDateString('zh-CN')}
              </Text>

              <Divider />

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  1. 服务描述
                </Text>
                <Text variant="bodyMd" as="p">
                  PreOrder Pro 是一款 Shopify 应用，为商家提供预订功能，包括：
                </Text>
                <ul>
                  <li>产品预订管理</li>
                  <li>库存到货通知</li>
                  <li>预订单处理</li>
                  <li>客户邮件通知</li>
                  <li>分期付款功能</li>
                  <li>数据分析和报告</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  2. 服务条件
                </Text>
                <Text variant="bodyMd" as="p">
                  使用我们的服务，您需要：
                </Text>
                <ul>
                  <li>拥有有效的 Shopify 商店</li>
                  <li>年满18岁或在您所在司法管辖区的法定年龄</li>
                  <li>提供准确、完整的注册信息</li>
                  <li>遵守所有适用的法律法规</li>
                  <li>不得将服务用于非法或未授权目的</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  3. 用户责任
                </Text>
                <Text variant="bodyMd" as="p">
                  作为用户，您有责任：
                </Text>
                <ul>
                  <li>保护您的账户安全和登录凭据</li>
                  <li>及时更新产品信息和库存状态</li>
                  <li>处理客户预订和查询</li>
                  <li>遵守消费者保护法律</li>
                  <li>不传播恶意软件或有害内容</li>
                  <li>不干扰或破坏服务运行</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  4. 服务可用性
                </Text>
                <Text variant="bodyMd" as="p">
                  我们努力提供稳定的服务，但不保证：
                </Text>
                <ul>
                  <li>服务100%无中断运行</li>
                  <li>所有功能在所有时间都可用</li>
                  <li>服务不会出现错误或缺陷</li>
                </ul>
                <Text variant="bodyMd" as="p">
                  我们会在计划维护前提前通知用户。
                </Text>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  5. 付费服务
                </Text>
                <Text variant="bodyMd" as="p">
                  对于付费功能：
                </Text>
                <ul>
                  <li>费用通过 Shopify 应用商店收取</li>
                  <li>订阅费用按月或按年收取</li>
                  <li>价格可能会发生变化，但会提前30天通知</li>
                  <li>取消订阅后，付费功能将停止工作</li>
                  <li>不提供按比例退款</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  6. 数据和隐私
                </Text>
                <Text variant="bodyMd" as="p">
                  关于您的数据：
                </Text>
                <ul>
                  <li>您保留对数据的所有权</li>
                  <li>我们按照隐私政策处理数据</li>
                  <li>卸载应用时，数据将在30天内删除</li>
                  <li>您可以随时请求导出或删除数据</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  7. 知识产权
                </Text>
                <Text variant="bodyMd" as="p">
                  PreOrder Pro 应用及其内容受知识产权法保护：
                </Text>
                <ul>
                  <li>我们拥有应用的所有权利</li>
                  <li>您获得使用许可，但不拥有应用</li>
                  <li>不得复制、修改或分发应用</li>
                  <li>您的商店数据仍属于您</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  8. 服务终止
                </Text>
                <Text variant="bodyMd" as="p">
                  服务可能在以下情况下终止：
                </Text>
                <ul>
                  <li>您违反服务条款</li>
                  <li>您的 Shopify 账户被暂停</li>
                  <li>长期不使用服务</li>
                  <li>我们决定停止提供服务</li>
                </ul>
                <Text variant="bodyMd" as="p">
                  终止时，我们会提前通知并协助数据导出。
                </Text>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  9. 免责声明
                </Text>
                <Text variant="bodyMd" as="p">
                  服务按"现状"提供，我们不承担以下责任：
                </Text>
                <ul>
                  <li>因服务中断导致的业务损失</li>
                  <li>数据丢失或损坏</li>
                  <li>第三方服务的问题</li>
                  <li>不可抗力事件</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  10. 责任限制
                </Text>
                <Text variant="bodyMd" as="p">
                  在任何情况下，我们的责任不超过：
                </Text>
                <ul>
                  <li>您在过去12个月支付的服务费用</li>
                  <li>直接损失，不包括间接损失</li>
                  <li>适用法律允许的最大限度</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  11. 争议解决
                </Text>
                <Text variant="bodyMd" as="p">
                  如发生争议：
                </Text>
                <ul>
                  <li>首先通过友好协商解决</li>
                  <li>协商不成可申请仲裁</li>
                  <li>适用中华人民共和国法律</li>
                  <li>争议由有管辖权的法院处理</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  12. 条款修改
                </Text>
                <Text variant="bodyMd" as="p">
                  我们可能会修改这些条款：
                </Text>
                <ul>
                  <li>重大修改会提前30天通知</li>
                  <li>继续使用服务表示接受新条款</li>
                  <li>不接受新条款可以停止使用服务</li>
                </ul>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  13. 联系信息
                </Text>
                <Text variant="bodyMd" as="p">
                  如有问题，请联系我们：
                </Text>
                <ul>
                  <li>邮箱：support@shopmall.dpdns.org</li>
                  <li>支持页面：https://shopmall.dpdns.org/support</li>
                  <li>工作时间：周一至周五 9:00-18:00 (UTC+8)</li>
                </ul>
              </Stack>

              <Divider />
              
              <Text variant="bodyMd" as="p" color="subdued">
                通过使用 PreOrder Pro 服务，您确认已阅读、理解并同意受这些服务条款约束。
              </Text>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

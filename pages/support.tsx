import React, { useState } from 'react'
import { 
  Card, 
  Page, 
  Layout, 
  Text, 
  Stack, 
  Divider, 
  Button,
  TextField,
  Select,
  TextContainer,
  Banner,
  Link,
  List
} from '@shopify/polaris'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const categoryOptions = [
    { label: '一般问题', value: 'general' },
    { label: '技术支持', value: 'technical' },
    { label: '账单问题', value: 'billing' },
    { label: '功能请求', value: 'feature' },
    { label: '错误报告', value: 'bug' },
    { label: '其他', value: 'other' }
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // 这里可以添加实际的表单提交逻辑
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      })
    }, 2000)
  }

  return (
    <Page
      title="客户支持"
      subtitle="PreOrder Pro 应用支持中心"
      backAction={{ content: '返回', url: '/' }}
    >
      <Layout>
        <Layout.Section>
          {showSuccess && (
            <Banner
              title="消息已发送"
              status="success"
              onDismiss={() => setShowSuccess(false)}
            >
              <p>我们已收到您的支持请求，将在24小时内回复您。</p>
            </Banner>
          )}

          <Card>
            <Stack vertical spacing="loose">
              <Text variant="headingMd" as="h2">
                联系我们
              </Text>
              
              <Text variant="bodyMd" as="p">
                遇到问题或需要帮助？我们随时为您提供支持！
              </Text>

              <Divider />

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  📞 联系方式
                </Text>
                <Stack vertical spacing="extraTight">
                  <Text variant="bodyMd" as="p">
                    <strong>邮箱：</strong> support@shopmall.dpdns.org
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>工作时间：</strong> 周一至周五 9:00-18:00 (UTC+8)
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>响应时间：</strong> 通常在24小时内回复
                  </Text>
                </Stack>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  🚀 快速帮助
                </Text>
                <Text variant="bodyMd" as="p">
                  在联系我们之前，请查看以下常见问题：
                </Text>
                
                <Card sectioned>
                  <Stack vertical spacing="tight">
                    <Text variant="headingSm" as="h4">
                      常见问题
                    </Text>
                    <List type="bullet">
                      <List.Item>
                        <Link url="/docs/setup-guide">如何设置预订功能？</Link>
                      </List.Item>
                      <List.Item>
                        <Link url="/docs/email-templates">如何自定义邮件模板？</Link>
                      </List.Item>
                      <List.Item>
                        <Link url="/docs/payment-settings">如何配置分期付款？</Link>
                      </List.Item>
                      <List.Item>
                        <Link url="/docs/troubleshooting">常见问题排查</Link>
                      </List.Item>
                    </List>
                  </Stack>
                </Card>
              </Stack>

              <Divider />

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  📝 提交支持请求
                </Text>
                
                <Stack vertical spacing="tight">
                  <TextField
                    label="姓名"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    placeholder="请输入您的姓名"
                  />
                  
                  <TextField
                    label="邮箱地址"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                    placeholder="请输入您的邮箱地址"
                  />
                  
                  <Select
                    label="问题类别"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                  />
                  
                  <TextField
                    label="主题"
                    value={formData.subject}
                    onChange={(value) => setFormData({ ...formData, subject: value })}
                    placeholder="请简要描述问题"
                  />
                  
                  <TextField
                    label="详细描述"
                    value={formData.message}
                    onChange={(value) => setFormData({ ...formData, message: value })}
                    multiline={4}
                    placeholder="请详细描述您遇到的问题，包括错误信息、操作步骤等"
                  />
                  
                  <Button
                    primary
                    loading={isSubmitting}
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
                  >
                    发送支持请求
                  </Button>
                </Stack>
              </Stack>

              <Divider />

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  📚 帮助资源
                </Text>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <Card sectioned>
                    <Stack vertical spacing="tight">
                      <Text variant="headingSm" as="h4">
                        📖 使用指南
                      </Text>
                      <Text variant="bodyMd" as="p">
                        详细的功能使用说明和最佳实践
                      </Text>
                      <Button outline>查看指南</Button>
                    </Stack>
                  </Card>
                  
                  <Card sectioned>
                    <Stack vertical spacing="tight">
                      <Text variant="headingSm" as="h4">
                        🎥 视频教程
                      </Text>
                      <Text variant="bodyMd" as="p">
                        观看视频了解如何使用各项功能
                      </Text>
                      <Button outline>观看视频</Button>
                    </Stack>
                  </Card>
                  
                  <Card sectioned>
                    <Stack vertical spacing="tight">
                      <Text variant="headingSm" as="h4">
                        🔧 API 文档
                      </Text>
                      <Text variant="bodyMd" as="p">
                        开发者集成和自定义开发文档
                      </Text>
                      <Button outline>查看文档</Button>
                    </Stack>
                  </Card>
                </div>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  🌟 功能建议
                </Text>
                <TextContainer>
                  <Text variant="bodyMd" as="p">
                    我们重视您的反馈！如果您有新功能建议或改进意见，请通过以下方式告诉我们：
                  </Text>
                  <List type="bullet">
                    <List.Item>发送邮件至 feedback@shopmall.dpdns.org</List.Item>
                    <List.Item>在支持表单中选择"功能请求"类别</List.Item>
                    <List.Item>加入我们的用户社区讨论</List.Item>
                  </List>
                </TextContainer>
              </Stack>

              <Stack vertical spacing="tight">
                <Text variant="headingMd" as="h3">
                  🚨 紧急支持
                </Text>
                <Banner status="info">
                  <p>
                    如果您遇到影响业务运营的紧急问题，请在邮件主题中标注"紧急"，
                    我们会优先处理您的请求。
                  </p>
                </Banner>
              </Stack>

              <Divider />
              
              <Text variant="bodyMd" as="p" color="subdued">
                PreOrder Pro 团队致力于为您提供最佳的客户体验。
                感谢您选择我们的产品！
              </Text>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

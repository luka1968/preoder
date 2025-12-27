// 邮件服务 - 使用 Brevo SMTP
import nodemailer from 'nodemailer';

interface PreorderConfirmationEmailParams {
    to: string;
    customerName: string;
    orderNumber: string;
    productName: string;
    quantity: number;
    totalAmount: string;
    estimatedDeliveryDate: string;
    shopDomain: string;
}

/**
 * 创建 SMTP 传输器
 */
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

/**
 * 发送预购确认邮件
 */
export async function sendPreorderConfirmationEmail(params: PreorderConfirmationEmailParams): Promise<void> {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .order-box {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .order-box h3 {
          margin-top: 0;
          color: #667eea;
          font-size: 20px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #dee2e6;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .label {
          color: #666;
          font-weight: 500;
        }
        .value {
          color: #333;
          font-weight: 600;
        }
        .highlight-box {
          background: #fff3cd;
          border: 2px dashed #ffc107;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: center;
        }
        .highlight-box strong {
          color: #856404;
          font-size: 18px;
        }
        .footer {
          text-align: center;
          padding: 30px 20px;
          background: #f8f9fa;
          color: #666;
          font-size: 14px;
        }
        .footer-note {
          font-size: 12px;
          color: #999;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🎉</div>
          <h1>Pre-Order Confirmed!</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${params.customerName},</p>
          
          <p style="font-size: 16px;">
            Great news! Your pre-order has been successfully placed. Thank you for your patience as we prepare your item.
          </p>
          
          <div class="order-box">
            <h3>📦 Order Details</h3>
            <div class="order-item">
              <span class="label">Order Number:</span>
              <span class="value">${params.orderNumber}</span>
            </div>
            <div class="order-item">
              <span class="label">Product:</span>
              <span class="value">${params.productName}</span>
            </div>
            <div class="order-item">
              <span class="label">Quantity:</span>
              <span class="value">${params.quantity}</span>
            </div>
            <div class="order-item">
              <span class="label">Total Amount:</span>
              <span class="value">$${params.totalAmount}</span>
            </div>
          </div>
          
          <div class="highlight-box">
            <p style="margin: 0 0 10px 0;">📅 <strong>Estimated Delivery Date</strong></p>
            <p style="margin: 0; font-size: 24px; color: #667eea; font-weight: bold;">
              ${params.estimatedDeliveryDate}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.8;">
            ✨ <strong>What's Next?</strong><br>
            We'll keep you updated via email as your order progresses. You'll receive another notification when your item ships.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Questions? We're here to help!</strong></p>
          <p style="margin: 0;">Visit: <a href="https://${params.shopDomain}" style="color: #667eea;">${params.shopDomain}</a></p>
          <p class="footer-note">
            PreOrder Pro - Making pre-orders easy
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    const mailOptions = {
        from: `"PreOrder Pro" <${process.env.SMTP_USER}>`,
        to: params.to,
        subject: `✅ Pre-Order Confirmed - Order ${params.orderNumber}`,
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
}

/**
 * 发送批量补货通知（占位符）
 */
export async function sendBulkBackInStockNotifications(
    subscriptions: any[],
    productName: string,
    productUrl: string
): Promise<{ sent: number; failed: number }> {
    // 占位符实现
    console.log(`Would send ${subscriptions.length} restock notifications for ${productName}`);
    return { sent: 0, failed: 0 };
}

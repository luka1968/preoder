# 🚀 Quick Start Guide

Get your PreOrder Pro Shopify app up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- Shopify Partner account
- Supabase account (already configured)
- Email service (Gmail recommended for testing)

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment

Your environment is already configured with:
- ✅ Shopify API credentials
- ✅ Supabase database connection
- ⚠️ Email service (needs configuration)

Update the email settings in `.env.local`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 3. Set Up Database

1. Go to your [Supabase Dashboard](https://app.supabase.com/project/YOUR_PROJECT_ID)
2. Navigate to SQL Editor
3. Copy and run the migration from `supabase/migrations/001_initial_schema.sql`

## 4. Configure Shopify App

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Create a new app or update existing app:
   - **App URL**: `http://localhost:3000` (for development)
   - **Redirect URL**: `http://localhost:3000/api/auth/shopify`
   - **Scopes**: Already configured in environment

## 5. Start Development

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

## 6. Test Installation

1. Create a development store in Shopify Partner Dashboard
2. Install your app: `http://localhost:3000/api/auth/shopify?shop=your-dev-store.myshopify.com`
3. Complete the OAuth flow
4. Access the dashboard to configure pre-order settings

## 7. Deploy to Production

When ready to deploy:

```bash
npm run deploy
```

This will:
- Build your app
- Deploy to Vercel
- Provide you with a production URL

Don't forget to update your Shopify app settings with the production URL!

## 🔧 Configuration

### Pre-order Settings
- Enable/disable pre-orders globally
- Customize button and badge text
- Set up partial payments
- Configure email templates

### Product Configuration
- Set pre-order dates per product
- Configure delivery estimates
- Set up inventory thresholds

### Email Notifications
- Back-in-stock alerts
- Pre-order confirmations
- Payment reminders

## 📊 Features Overview

### ✅ Completed Features
- Pre-order management system
- Back-in-stock notifications
- Email notification system
- Admin dashboard with analytics
- Product-specific configurations
- Shopify webhook integration
- Responsive UI components

### 🚧 Upcoming Features
- Partial payment processing
- Multi-language support
- Advanced analytics
- Subscription billing

## 🆘 Troubleshooting

### Common Issues

**App won't install:**
- Check Shopify app URL and redirect URL
- Verify API credentials
- Ensure webhook secret is configured

**Database errors:**
- Verify Supabase credentials
- Check if migration was run successfully
- Ensure RLS policies are correct

**Email not working:**
- Verify SMTP credentials
- Check Gmail app password setup
- Test with a simple email service first

### Getting Help

1. Check the [full documentation](README.md)
2. Review the [deployment guide](DEPLOYMENT.md)
3. Create an issue on GitHub
4. Check Shopify and Supabase documentation

## 🎉 Next Steps

Once your app is running:

1. **Configure your first product** for pre-orders
2. **Set up email templates** for notifications
3. **Test the customer experience** on your development store
4. **Monitor analytics** in the dashboard
5. **Deploy to production** when ready

---

**Need help?** Check the detailed [README](README.md) or [deployment guide](DEPLOYMENT.md) for more information.

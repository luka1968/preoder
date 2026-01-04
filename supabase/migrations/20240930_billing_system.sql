-- Billing System Migration
-- Create tables for pricing plans, subscriptions, and usage tracking

-- Pricing Plans Table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop Subscriptions Table
CREATE TABLE IF NOT EXISTS shop_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES pricing_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, past_due, trialing
  billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly'))
);

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES shop_subscriptions(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL, -- preorder_orders, restock_emails, partial_payments
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(shop_id, usage_type, period_start)
);

-- Billing Events Table (for audit trail)
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES shop_subscriptions(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- subscription_created, plan_changed, payment_succeeded, etc.
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing plans
INSERT INTO pricing_plans (name, price_monthly, price_yearly, features, limits) VALUES 
(
  'Free',
  0.00,
  0.00,
  '{
    "preorder_orders": true,
    "restock_emails": true,
    "basic_badges": true,
    "email_notifications": true,
    "basic_scheduling": true,
    "order_management": true,
    "multilingual": true
  }',
  '{
    "preorder_orders_per_month": 1,
    "restock_emails_per_month": 50,
    "partial_payments": false,
    "discount_codes": false,
    "email_template_editing": false,
    "remove_branding": false,
    "priority_support": false
  }'
),
(
  'Pro',
  6.90,
  69.00,
  '{
    "preorder_orders": true,
    "restock_emails": true,
    "basic_badges": true,
    "advanced_badges": true,
    "email_notifications": true,
    "advanced_scheduling": true,
    "order_management": true,
    "multilingual": true,
    "partial_payments": true,
    "discount_codes": true,
    "email_template_editing": true,
    "analytics": true,
    "priority_support": true,
    "remove_branding": true
  }',
  '{
    "preorder_orders_per_month": 1000,
    "restock_emails_per_month": 1000,
    "partial_payments": true,
    "discount_codes": true,
    "email_template_editing": true,
    "remove_branding": true,
    "priority_support": true
  }'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shop_subscriptions_shop_id ON shop_subscriptions(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_subscriptions_status ON shop_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_shop_id ON usage_tracking(shop_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_billing_events_shop_id ON billing_events(shop_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON pricing_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_subscriptions_updated_at BEFORE UPDATE ON shop_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add plan column to existing shops table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shops' AND column_name = 'current_plan') THEN
        ALTER TABLE shops ADD COLUMN current_plan VARCHAR(20) DEFAULT 'free';
    END IF;
END $$;

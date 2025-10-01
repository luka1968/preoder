#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up PreOrder Pro...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please copy .env.example to .env.local and fill in your configuration.');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check environment variables
console.log('🔧 Checking environment configuration...');
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const missingVars = requiredVars.filter(varName => {
  const regex = new RegExp(`^${varName}=.+$`, 'm');
  return !regex.test(envContent) || envContent.includes(`${varName}=your_`);
});

if (missingVars.length > 0) {
  console.log('⚠️  Missing or incomplete environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nPlease update your .env.local file with the correct values.\n');
} else {
  console.log('✅ Environment configuration looks good!\n');
}

// Database setup reminder
console.log('🗄️  Database Setup Reminder:');
console.log('1. Make sure you have run the SQL migration in your Supabase dashboard');
console.log('2. Copy the content from supabase/migrations/001_initial_schema.sql');
console.log('3. Run it in the Supabase SQL Editor\n');

// Shopify app setup reminder
console.log('🛍️  Shopify App Setup:');
console.log('1. Create a new app in your Shopify Partner Dashboard');
console.log('2. Set the App URL to your deployment URL');
console.log('3. Set the redirect URL to: [YOUR_URL]/api/auth/shopify');
console.log('4. Update SHOPIFY_APP_URL in your .env.local\n');

console.log('🎉 Setup complete! You can now run:');
console.log('   npm run dev     - Start development server');
console.log('   npm run build   - Build for production');
console.log('   npm run start   - Start production server\n');

console.log('📚 For detailed setup instructions, see DEPLOYMENT.md');

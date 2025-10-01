#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying PreOrder Pro to Vercel...\n');

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully!\n');
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI:', installError.message);
    process.exit(1);
  }
}

// Check if user is logged in to Vercel
try {
  execSync('vercel whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Vercel\n');
} catch (error) {
  console.log('❌ Not logged in to Vercel. Please run: vercel login');
  process.exit(1);
}

// Build the project
console.log('🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  const deployOutput = execSync('vercel --prod', { encoding: 'utf8' });
  console.log('✅ Deployment successful!\n');
  
  // Extract deployment URL
  const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deploymentUrl = urlMatch[0];
    console.log(`🌐 Your app is live at: ${deploymentUrl}\n`);
    
    // Reminder about Shopify app configuration
    console.log('⚠️  Important: Update your Shopify app configuration:');
    console.log(`1. App URL: ${deploymentUrl}`);
    console.log(`2. Redirect URL: ${deploymentUrl}/api/auth/shopify`);
    console.log('3. Update SHOPIFY_APP_URL environment variable in Vercel dashboard\n');
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('🎉 Deployment complete!');
console.log('📊 Monitor your app at: https://vercel.com/dashboard');
console.log('🔧 Manage environment variables in Vercel project settings');

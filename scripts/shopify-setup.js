#!/usr/bin/env node

/**
 * Shopify CLI Setup Script
 * Helps configure shopify.app.toml with environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const TOML_PATH = path.join(process.cwd(), 'shopify.app.toml');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateTomlConfig() {
  console.log('🛠️  Shopify CLI Configuration Setup');
  console.log('=====================================\n');

  try {
    // Read current TOML file
    let tomlContent = fs.readFileSync(TOML_PATH, 'utf8');

    // Get configuration from user
    const clientId = await question('Enter your Shopify Client ID: ');
    const appUrl = await question('Enter your application URL (e.g., https://your-app.vercel.app): ');
    const devStore = await question('Enter your development store URL (e.g., your-store.myshopify.com): ');

    // Update TOML content
    tomlContent = tomlContent.replace('client_id = "YOUR_CLIENT_ID"', `client_id = "${clientId}"`);
    tomlContent = tomlContent.replace('application_url = "https://your-domain.vercel.app"', `application_url = "${appUrl}"`);
    tomlContent = tomlContent.replace('dev_store_url = "your-dev-store.myshopify.com"', `dev_store_url = "${devStore}"`);
    
    // Update redirect URLs
    tomlContent = tomlContent.replace(/https:\/\/your-domain\.vercel\.app/g, appUrl);

    // Write updated content
    fs.writeFileSync(TOML_PATH, tomlContent);

    console.log('\n✅ shopify.app.toml updated successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run shopify:dev');
    console.log('3. Follow the CLI prompts to authenticate');

  } catch (error) {
    console.error('❌ Error updating configuration:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function main() {
  if (!fs.existsSync(TOML_PATH)) {
    console.error('❌ shopify.app.toml not found. Please ensure the file exists.');
    process.exit(1);
  }

  await updateTomlConfig();
}

main().catch(console.error);

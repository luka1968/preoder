# Requirements Document

## Introduction

This feature addresses the failure of Draft Order creation in the Shopify PreOrder application. The test page at `/test-direct` is failing with error "缺少 write_draft_orders 权限" (Missing write_draft_orders permission). The Vercel environment variable SHOPIFY_SCOPES already includes write_draft_orders, but the database shops table still has the old scope "write_inventory,write_orders,write_products,write_themes". The system needs to guide the merchant through re-authorization to update the database with the new scope, and optionally provide a manual database update method as a quick fix.

## Glossary

- **Draft Order System**: The Shopify PreOrder application component responsible for creating draft orders via Shopify Admin API
- **Test Interface**: The web page at `/test-direct` that allows merchants to test draft order creation
- **API Endpoint**: The backend handler at `/api/test-draft-order-direct` that processes draft order creation requests
- **Access Token**: The OAuth token stored in Supabase that authenticates API requests to Shopify
- **Variant ID**: The unique identifier for a product variant in Shopify (e.g., 49733009596732)

## Requirements

### Requirement 1

**User Story:** As a merchant, I want to re-authorize the app to update permissions, so that the application can create draft orders with the new write_draft_orders permission

#### Acceptance Criteria

1. WHEN the merchant visits the re-authorization URL, THE OAuth System SHALL redirect them to Shopify's authorization page with the updated SHOPIFY_SCOPES from Vercel environment variables
2. WHEN the merchant approves the authorization, THE OAuth Callback Handler SHALL receive the new access_token and scope from Shopify
3. WHEN the OAuth callback completes, THE System SHALL update the shops table with the new access_token and scope including write_draft_orders
4. WHEN the database is updated, THE Draft Order System SHALL have permission to create draft orders via the Shopify Admin API
5. WHEN re-authorization succeeds, THE System SHALL redirect the merchant to a success page confirming the permission update

### Requirement 2

**User Story:** As a developer, I want a quick manual fix option to update the database scope, so that I can test draft order creation immediately without waiting for merchant re-authorization

#### Acceptance Criteria

1. WHEN the developer creates a manual update API endpoint, THE Endpoint SHALL accept the shop domain as a parameter
2. WHEN the endpoint is called, THE System SHALL read the current SHOPIFY_SCOPES from environment variables
3. WHEN the scope is retrieved, THE System SHALL update the shops table scope field with the current SHOPIFY_SCOPES value
4. WHEN the update completes, THE Endpoint SHALL return a success response with the old and new scope values
5. THE Manual Update SHALL only update the scope field without changing the access_token or other shop data

### Requirement 3

**User Story:** As a merchant, I want to test draft order creation after re-authorization, so that I can verify the preorder system is working correctly

#### Acceptance Criteria

1. WHEN the merchant has the write_draft_orders permission and enters a valid Variant ID, THE Draft Order System SHALL create a draft order in Shopify within 5 seconds
2. WHEN the draft order is created successfully, THE Test Interface SHALL display a green success banner with the draft order ID, name, and a link to view it in Shopify admin
3. IF the draft order creation fails due to API errors, THEN THE Test Interface SHALL display the Shopify API error message and details
4. WHEN the test is running, THE Test Interface SHALL display a loading state with text "测试中..." and disable the submit button
5. WHEN the Variant ID field is empty, THE Test Interface SHALL disable the submit button and show a visual indication that the field is required

### Requirement 4

**User Story:** As a developer, I want to update the Shopify Partner Dashboard configuration, so that the app requests the correct permissions during installation

#### Acceptance Criteria

1. WHEN the developer accesses the Shopify Partner Dashboard app settings, THE Configuration Interface SHALL allow editing the API scopes
2. WHEN the developer adds write_draft_orders to the scopes, THE Shopify Partner Dashboard SHALL save the updated configuration
3. WHEN the scopes are updated in the Partner Dashboard, THE Shopify Platform SHALL require existing installations to re-authorize with the new permissions
4. WHEN new merchants install the app, THE OAuth Flow SHALL automatically request all configured scopes including write_draft_orders
5. THE Configuration SHALL be consistent between the SHOPIFY_SCOPES environment variable and the Shopify Partner Dashboard settings

### Requirement 5

**User Story:** As a developer, I want comprehensive error diagnostics and logging, so that I can quickly identify permission and configuration issues

#### Acceptance Criteria

1. WHEN the API Endpoint checks permissions, THE Draft Order System SHALL log the current scope and whether write_draft_orders is present
2. WHEN the write_draft_orders permission is missing, THE API Endpoint SHALL return a 403 status code with error message "缺少 write_draft_orders 权限" and the currentScope field
3. WHEN the Access Token is missing, THE API Endpoint SHALL return a 500 status code with error message "Access Token 不存在"
4. WHEN the shop is not found in the database, THE API Endpoint SHALL return a 404 status code with error message "店铺未找到"
5. WHEN any error occurs, THE API Endpoint SHALL include debug information with hasAccessToken, hasWritePermission, variantId, and apiUrl fields

-- ============================================
-- CLEANUP SCRIPT: Remove Test Email Accounts
-- ============================================
-- Use this to delete test dealer accounts for reuse in testing
-- Run: mysql -u root -p deals_hub < cleanup-test-data.sql

-- First, get the IDs of test accounts
SELECT id, business_name, provider_email FROM service_providers WHERE provider_email IN (
  'test@gmail.com',
  'test1@gmail.com',
  'test2@gmail.com',
  'test3@gmail.com',
  'test@test.com',
  'demo@gmail.com',
  'demo@test.com',
  'business@test.com',
  'shop@test.com'
);

-- Delete products for test dealers first (foreign key constraint)
DELETE FROM products WHERE dealer_id IN (
  SELECT id FROM service_providers WHERE provider_email IN (
    'test@gmail.com',
    'test1@gmail.com',
    'test2@gmail.com',
    'test3@gmail.com',
    'test@test.com',
    'demo@gmail.com',
    'demo@test.com',
    'business@test.com',
    'shop@test.com'
  )
);

-- Now delete test service provider accounts
DELETE FROM service_providers WHERE provider_email IN (
  'test@gmail.com',
  'test1@gmail.com',
  'test2@gmail.com',
  'test3@gmail.com',
  'test@test.com',
  'demo@gmail.com',
  'demo@test.com',
  'business@test.com',
  'shop@test.com'
);

-- Verify deletion
SELECT 'Remaining Dealers:' as result;
SELECT id, business_name, provider_email FROM service_providers ORDER BY created_at DESC;
SELECT CONCAT('Total Dealers: ', COUNT(*)) as total FROM service_providers;

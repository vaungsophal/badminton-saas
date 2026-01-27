-- Migration: Replace Stripe fields with generic payment fields
-- -- File: migrations/002_replace_stripe_with_aba_payway.sql

-- Update bookings table
ALTER TABLE bookings 
ALTER COLUMN payment_method DROP DEFAULT,
ALTER COLUMN payment_method SET DEFAULT 'aba_payway';

-- Rename stripe_session_id to transaction_id in bookings
ALTER TABLE bookings RENAME COLUMN stripe_session_id TO transaction_id;

-- Update payments table
ALTER TABLE payments 
ALTER COLUMN payment_method DROP DEFAULT,
ALTER COLUMN payment_method SET DEFAULT 'aba_payway';

-- Rename stripe_payment_intent_id to transaction_id in payments
ALTER TABLE payments RENAME COLUMN stripe_payment_intent_id TO transaction_id;

-- Remove stripe_session_id from payments (redundant now)
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_session_id;

-- Add gateway_response column for storing payment gateway responses
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_response JSONB DEFAULT '{}';

-- Update existing records
UPDATE bookings SET payment_method = 'aba_payway' WHERE payment_method = 'stripe';
UPDATE payments SET payment_method = 'aba_payway' WHERE payment_method = 'stripe';

-- Add comments
COMMENT ON COLUMN bookings.transaction_id IS 'Transaction ID from payment gateway (ABA Payway)';
COMMENT ON COLUMN payments.transaction_id IS 'Transaction ID from payment gateway (ABA Payway)';
COMMENT ON COLUMN payments.gateway_response IS 'Raw response data from payment gateway';
# ABA PayWay Integration Guide

This guide explains how the badminton booking system integrates with ABA PayWay for payment processing.

## Overview

The system has been completely migrated from Stripe to ABA PayWay, Cambodia's trusted payment gateway. All payment flows now use ABA PayWay's secure checkout system.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# ABA Payway Configuration
ABA_MERCHANT_ID=your_merchant_id_here
ABA_API_KEY=your_api_key_here
ABA_BASE_URL=https://checkout-sandbox.payway.com.kh/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Your application URL
```

### Production vs Sandbox

- **Sandbox**: `https://checkout-sandbox.payway.com.kh`
- **Production**: `https://checkout.payway.com.kh`

The system automatically switches based on `NODE_ENV`:

```env
NODE_ENV=production  # Uses production URL
NODE_ENV=development # Uses sandbox URL
```

## Database Schema Changes

The payment system has been updated with the following changes:

### Bookings Table
- `payment_method`: Default changed from `'stripe'` to `'aba_payway'`
- `transaction_id`: Renamed from `stripe_session_id`

### Payments Table
- `payment_method`: Default changed from `'stripe'` to `'aba_payway'`
- `transaction_id`: Renamed from `stripe_payment_intent_id`
- `gateway_response`: New JSONB field to store ABA PayWay response data

## API Endpoints

### Payment Creation
```
POST /api/payments/create
```

Creates a pending payment record in the database.

### Payment Status Update
```
POST /api/payments/update-status
```

Updates payment status based on ABA PayWay response.

### ABA PayWay Webhook
```
POST /api/webhooks/aba-payway
```

Handles payment success/failure notifications from ABA PayWay.

## Payment Flow

### 1. Initiate Payment
```typescript
// Frontend component calls ABA PayWay
const { paymentUrl } = abaPayway.createPaymentRequest({
  tran_id: 'BAD123456789',
  amount: 25.00,
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
  phone: '+85512345678',
  payment_description: 'Court booking: Court 1 on 2024-02-10 at 18:00',
  return_url: 'https://yoursite.com/dashboard/payment/123/success'
})
```

### 2. Redirect to ABA PayWay
User is redirected to ABA PayWay's secure checkout page.

### 3. Payment Processing
ABA PayWay processes the payment and returns to the specified return URL.

### 4. Payment Verification
The success page verifies the payment and updates the database:

```typescript
// Verify payment signature
const isValid = abaPayway.verifyPaymentResponse(responseParams)

// Update payment status
await fetch('/api/payments/update-status', {
  method: 'POST',
  body: JSON.stringify({
    transaction_id: tranId,
    status: 'completed',
    ...responseParams
  })
})
```

## Security Features

### SHA-512 Hash Verification
All ABA PayWay responses are verified using SHA-512 hash to prevent tampering:

```typescript
const isValid = abaPayway.verifyPaymentResponse({
  tran_id: 'BAD123456789',
  status: '00',
  amount: '25.00',
  hash: 'generated_sha512_hash'
})
```

### SSL/TLS Encryption
- All communications with ABA PayWay use HTTPS
- Customer data is encrypted during transmission

## Components

### ABAPayment Component
Location: `components/aba-payment.tsx`

Handles the complete payment flow:
- Customer information form
- Payment initiation
- Redirect to ABA PayWay

### PaymentCheckout Component
Location: `components/payment-checkout.tsx`

Wrapper component that manages loading states and integrates with ABA PayWay.

## Error Handling

### Common Error Scenarios

1. **Invalid Signature**
   - Log: "Invalid ABA Payway signature"
   - Action: Reject payment, log security incident

2. **Missing Parameters**
   - Log: "Missing transaction_id or status"
   - Action: Return 400 error

3. **Payment Record Not Found**
   - Log: "Payment record not found for transaction: {tran_id}"
   - Action: Return 404 error

4. **Email Sending Failed**
   - Log: "Failed to send confirmation email"
   - Action: Continue processing, log error for manual follow-up

## Testing

### Sandbox Testing

1. Use sandbox credentials in `.env`:
```env
ABA_MERCHANT_ID=test_merchant_id
ABA_API_KEY=test_api_key
```

2. Test card numbers (sandbox):
- Successful: `3100 0000 0000 02`
- Failed: `3100 0000 0000 03`

### Manual Testing Steps

1. Create a booking
2. Proceed to payment page
3. Fill in customer details
4. Click "Pay with ABA Payway"
5. Complete payment in sandbox
6. Verify redirect to success page
7. Check database for payment record
8. Verify booking status updated to 'confirmed'

## Migration Notes

### From Stripe
- Removed all Stripe dependencies
- Updated database schema (see migration file)
- Replaced webhook handlers
- Updated frontend components

### Dependencies Removed
- `@stripe/react-stripe-js`
- `@stripe/stripe-js` 
- `stripe`

### Files Removed
- `lib/stripe.ts`
- `app/api/webhooks/stripe/`

## Troubleshooting

### Common Issues

1. **Payment not creating**
   - Check ABA PayWay credentials
   - Verify database connection
   - Check network connectivity

2. **Signature verification failing**
   - Ensure API key is correct
   - Check parameter order in hash generation
   - Verify URL encoding

3. **Webhook not receiving**
   - Check webhook URL in ABA PayWay dashboard
   - Verify firewall settings
   - Check SSL certificate

### Debug Mode

Enable debug logging:
```typescript
console.log('ABA PayWay Request:', paymentRequest)
console.log('ABA PayWay Response:', responseParams)
```

## Support

For ABA PayWay specific issues:
- ABA PayWay Merchant Portal
- ABA PayWay Technical Support
- Integration documentation at aba.com.kh

For application issues:
- Check application logs
- Verify database migrations
- Test with sandbox credentials
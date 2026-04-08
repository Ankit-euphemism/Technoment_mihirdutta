# 🚀 Razorpay Implementation - Quick Reference

## Files Created/Modified

### Frontend Services
- **`src/services/razorpayService.ts`** - Core Razorpay integration
  - `loadRazorpayScript()` - Late script loading
  - `createRazorpayOrder()` - Creates order on backend
  - `openRazorpayPayment()` - Opens modal
  - `verifyPayment()` - Verifies payment on backend
  - Helpers: `formatAmountToPaise()`, `formatPaiseToRupees()`

### Frontend Components
- **`src/components/features/ticketing/TicketPurchase.tsx`** - Updated
  - Now integrates Razorpay payment flow
  - Handles order creation & verification
  - Improved UX with loading states
  - Mobile-responsive

### Backend Edge Functions
- **`RAZORPAY_EDGE_FUNCTIONS.ts`** - Copy to Supabase
  - `create-razorpay-order` function
    - Validates stock
    - Rate limiting
    - Creates Razorpay order
  - `verify-razorpay-payment` function
    - Signature verification
    - QR code generation
    - Ticket creation

### Database
- Tables needed:
  - `payment_orders` - Track all orders
  - `payments` - Successful payments only
  - `tickets` - Enhanced with QR codes

### Documentation
1. **`RAZORPAY_SETUP.md`** - Complete 30-minute setup guide
2. **`RAZORPAY_IMPLEMENTATION_CHECKLIST.md`** - Step-by-step checklist
3. **`.env.example`** - Env variable template

---

## Key Features Implemented

### Security ✅
```
✅ PCI-DSS compliant (no card data on frontend)
✅ HMAC-SHA256 signature verification
✅ Rate limiting (1 order/min per user)
✅ Duplicate payment prevention
✅ QR codes are signed JWT tokens
✅ Time-bound QR codes (24 hours)
```

### UX ✅
```
✅ Razorpay modal (card/UPI/net banking/wallets)
✅ Real-time payment status
✅ Error handling with user messages
✅ Mobile-optimized
✅ Loading states & feedback
```

### Backend ✅
```
✅ Event stock validation
✅ Order creation & tracking
✅ Payment verification
✅ Automatic QR code generation
✅ Ticket creation in DB
```

---

## Current Pricing

```
₹99 per ticket

Razorpay fee varies by payment method:
- Cards: 2% (₹1.98)
- UPI: 1% (₹0.99)
- Net Banking: 0.5% (₹0.50)

User pays: ₹99.00
+ Razorpay fee: ₹0.99 - ₹1.98
= Total: ₹100 - ₹101

Adjust in TicketPurchase.tsx line 44:
const pricePerTicket = 99; // Change to desired amount
```

---

## Payment Flow (5 Steps)

```
1️⃣  User selects quantity & clicks "Pay ₹99"
    ↓
2️⃣  Frontend calls createRazorpayOrder()
    Backend creates order + validates stock
    ↓
3️⃣  Razorpay modal opens
    User pays via card/UPI/wallet
    ↓
4️⃣  Payment successful
    Frontend calls verifyPayment()
    ↓
5️⃣  Backend verifies signature
    Creates tickets + sends QR codes
    ✅ Success!
```

---

## API Endpoints

### Create Order
```bash
POST /functions/v1/create-razorpay-order

Request:
{
  "event_id": "uuid",
  "user_id": "uuid",
  "quantity": 1,
  "amount": 9900  # in paise
}

Response:
{
  "id": "order_ABC123",
  "amount": 9900,
  "currency": "INR",
  "status": "created",
  "notes": { "event_id": "...", "user_id": "..." }
}
```

### Verify Payment
```bash
POST /functions/v1/verify-razorpay-payment

Request:
{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "sig...",
  "event_id": "uuid",
  "user_id": "uuid",
  "quantity": 1
}

Response:
{
  "success": true,
  "tickets": [
    {
      "id": "ticket-123",
      "qr_code": "eyJhbG...",
      "qr_code_expires_at": "2026-04-09T10:00:00Z",
      "ticket_number": "TKT-001"
    }
  ]
}
```

---

## Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=anon_key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Backend (Supabase Dashboard → Settings → Functions)
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
JWT_SECRET=base64_encoded_secret
```

Generate JWT_SECRET:
```bash
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Test Credentials

**Test Mode (Sandbox):**

Credit Card:
```
4111 1111 1111 1111
Exp: 12/25
CVV: 123
OTP: 000000
```

Debit Card:
```
5555 5555 5555 4444
Exp: 12/25
CVV: 456
OTP: 000000
```

UPI:
```
success@razorpay
OTP: 000000
```

---

## Database Schema Quick Reference

```sql
-- Payment Orders Tracking
CREATE TABLE payment_orders (
  razorpay_order_id VARCHAR PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  quantity INTEGER,
  amount INTEGER,
  status VARCHAR DEFAULT 'created',
  created_at TIMESTAMP DEFAULT now()
);

-- Successful Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  razorpay_payment_id VARCHAR UNIQUE NOT NULL,
  razorpay_order_id VARCHAR NOT NULL,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  amount INTEGER,
  quantity INTEGER,
  status VARCHAR DEFAULT 'success',
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Tickets (with QR codes)
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  ticket_number VARCHAR UNIQUE,
  qr_code TEXT,  -- Signed JWT
  qr_code_expires_at TIMESTAMP,
  is_checked_in BOOLEAN DEFAULT false,
  purchase_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Imports for Developers

```typescript
// In your components:
import {
  createRazorpayOrder,
  openRazorpayPayment,
  verifyPayment,
  formatAmountToPaise,
  formatPaiseToRupees,
  loadRazorpayScript,
} from '@/services/razorpayService';

// Types:
import type {
  RazorpayOrder,
  RazorpayPaymentResponse,
  PaymentVerificationRequest,
} from '@/services/razorpayService';
```

---

## Common Error Messages & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| `Payment signature verification failed` | tampered payment | Reject, show error |
| `Payment already processed` | duplicate attempt | Show "already purchased" |
| `Only X tickets available` | sold out | Show availability |
| `Please wait before creating another order` | rate limited | Wait 1 min |
| `Event not found` | bad event_id | Verify event exists |
| `Razorpay script not loaded` | CDN failure | Use fallback |
| `VITE_RAZORPAY_KEY_ID not found` | missing env var | Check .env.local |

---

## Timeline to Launch

```
Phase 1: Setup (15 min)
  ✅ Create Razorpay account
  ✅ Get credentials
  ✅ Create .env.local

Phase 2: Supabase (20 min)
  ✅ Create tables (SQL)
  ✅ Add env variables
  ✅ Deploy Edge Functions

Phase 3: Test (15 min)
  ✅ Test with test card
  ✅ Verify database records
  ✅ Check QR code creation

Phase 4: Production (5 min)
  ✅ Switch to live keys
  ✅ Update env variables
  ✅ Test with real card

TOTAL: ~55 minutes to go live! 🚀
```

---

## What's Next

### Immediate (MVP)
- [ ] Deploy Edge Functions to Supabase
- [ ] Test payment flow end-to-end
- [ ] Go live with production keys

### Short Term
- [ ] Email QR codes to users
- [ ] SMS notifications
- [ ] Payment receipt emails

### Future Enhancements
- [ ] Refund processing
- [ ] Discount codes
- [ ] Bulk ticket generation
- [ ] Analytics dashboard
- [ ] Subscription tickets
- [ ] Webhook logging
- [ ] Payment retry logic

---

## Razorpay Resources

- **Dashboard:** https://dashboard.razorpay.com
- **Docs:** https://razorpay.com/docs/payments
- **API Ref:** https://razorpay.com/api
- **Support:** support@razorpay.com
- **Test Keys:** https://razorpay.com/docs/payments/test-key

---

## Summary

✅ **Complete Razorpay integration implemented**
✅ **Frontend component ready**
✅ **Backend Edge Functions ready to deploy**
✅ **Database schema provided**
✅ **Security best practices followed**
✅ **Comprehensive documentation included**

**You're ready to launch!** Follow the checklist in `RAZORPAY_IMPLEMENTATION_CHECKLIST.md` 🎉

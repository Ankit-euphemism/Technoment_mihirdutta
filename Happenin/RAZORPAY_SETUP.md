# Razorpay Payment Gateway Setup Guide

## 🔧 Installation & Configuration

### Step 1: Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Copy:
   - **Key ID** (public key) - starts with `rzp_test_` or `rzp_live_`
   - **Key Secret** (private key) - keep this secret!

### Step 2: Create .env.local

Create `Happenin/.env.local`:

```env
# Frontend Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Backend Environment Variables (for Supabase Edge Functions)
# These go in Supabase dashboard Settings → Edge Functions
# RAZORPAY_KEY_ID=rzp_test_your_key_id
# RAZORPAY_KEY_SECRET=your_key_secret
# JWT_SECRET=your_jwt_secret_from_earlier
```

### Step 3: Add Secrets to Supabase

1. Supabase Dashboard → **Settings → Functions**
2. Add these environment variables:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret
   JWT_SECRET=your_jwt_secret
   ```

### Step 4: Deploy Edge Functions

Copy code from `RAZORPAY_EDGE_FUNCTIONS.ts` to:

```bash
supabase/functions/
├── create-razorpay-order/
│   └── index.ts  (Copy create-razorpay-order function)
└── verify-razorpay-payment/
    └── index.ts  (Copy verify-razorpay-payment function)
```

Deploy:
```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

---

## 📊 Database Schema

Create these tables in Supabase SQL Editor:

```sql
-- Store Razorpay orders (for tracking)
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id VARCHAR UNIQUE NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- in paise
  status VARCHAR DEFAULT 'created', -- created, paid, failed
  notes JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Store successful payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id VARCHAR NOT NULL REFERENCES payment_orders(razorpay_order_id),
  razorpay_payment_id VARCHAR UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id),
  amount INTEGER NOT NULL, -- in paise
  quantity INTEGER NOT NULL,
  status VARCHAR DEFAULT 'success', -- success, failed, refunded
  verified_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_payment_orders_event_id ON payment_orders(event_id);
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_razorpay_id ON payment_orders(razorpay_order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_payment_id ON payments(razorpay_payment_id);
```

---

## 🔐 Security Implementation

### Frontend Security

✅ **PCI-DSS Compliance:**
- Never handle card data directly
- Razorpay handles all payment processing
- Frontend only sends order details

✅ **Secret Storage:**
- `VITE_RAZORPAY_KEY_ID` - Public key (safe to expose)
- Never store `RAZORPAY_KEY_SECRET` in frontend

### Backend Security

✅ **Signature Verification:**
```typescript
// Verify payment came from Razorpay
const generatedSignature = HMAC-SHA256(
  `${razorpay_order_id}|${razorpay_payment_id}`,
  RAZORPAY_KEY_SECRET
);

if (generatedSignature !== razorpay_signature) {
  // Payment is FAKE - reject it
}
```

✅ **Rate Limiting:**
- Max 1 order per user per minute
- Prevents order spam

✅ **Duplicate Prevention:**
- Check if payment already processed
- Prevent double-charging

---

## 💰 Current Pricing

```
Per Ticket: ₹99.00

Razorpay Fees:
- Cards: 2% (₹1.98)
- UPI: 1% (₹0.99)
- Net Banking: 0.5% (₹0.50)
- Wallets: 1% (₹0.99)

Example for 1 ticket:
  Ticket Cost: ₹99.00
  + Razorpay Fee: ₹1.98 (2% for card)
  = Total: ₹100.98

Adjust pricing in TicketPurchase.tsx:
  const pricePerTicket = 99; // in rupees
```

---

## 🔄 Payment Flow

```
1. User clicks "Pay ₹99"
         ↓
2. Frontend calls createRazorpayOrder()
         ↓
3. Backend creates order in Razorpay API
         ↓
4. Frontend opens Razorpay modal
         ↓
5. User pays (card/UPI/net banking/wallet)
         ↓
6. Razorpay returns payment_id & signature
         ↓
7. Frontend calls verifyPayment()
         ↓
8. Backend verifies signature (prevents spoofing)
         ↓
9. If valid: Create tickets + Send QR codes
         ↓
10. ✅ User receives tickets via email
```

---

## 🧪 Testing

### Test Mode (Sandbox)

Razorpay provides test cards:

**Credit Card:**
```
Card: 4111 1111 1111 1111
Exp: 12/25
CVV: 123
```

**Debit Card:**
```
Card: 5555 5555 5555 4444
Exp: 12/25
CVV: 456
```

**Wallet (UPI):**
```
UPI: success@razorpay
```

### Manual Testing

```bash
# Test order creation
curl -X POST http://localhost:3000/functions/v1/create-razorpay-order \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt-123",
    "user_id": "usr-456",
    "quantity": 2,
    "amount": 19800
  }'

# Test payment verification
curl -X POST http://localhost:3000/functions/v1/verify-razorpay-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "sig_xxx",
    "event_id": "evt-123",
    "user_id": "usr-456",
    "quantity": 2
  }'
```

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Payment signature verification failed` | Fake/tampered payment | Reject payment |
| `Payment already processed` | Duplicate attempt | Show "already purchased" message |
| `Only X tickets available` | Event sold out | Show availability |
| `Too many orders. Wait before trying again.` | Rate limited | Wait 1 minute before retrying |

---

## 📧 Email QR Codes (TODO)

After successful payment, send email:

```html
<subject>Your Happenin Tickets - QR Codes Inside 🎫</subject>

<body>
  <h1>Welcome to [Event Name]!</h1>
  
  <p>You've purchased 2 tickets for ₹198.00</p>
  
  <h2>Your QR Codes:</h2>
  [Display QR codes for each ticket]
  
  <p>Instructions:</p>
  <ul>
    <li>Show these QR codes at event entry</li>
    <li>Each QR code is unique and time-bound</li>
    <li>Codes expire at event end</li>
    <li>Never share your QR codes</li>
  </ul>
  
  <p>See you at the event! 🎉</p>
</body>
```

---

## 🔧 Troubleshooting

### Issue: Razorpay script not loading

```typescript
// Check if script loaded
const isLoaded = await loadRazorpayScript();
if (!isLoaded) {
  console.error('Razorpay script failed to load');
  // Fallback to alternative payment
}
```

### Issue: CORS errors

Make sure Edge Function headers are correct:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}
```

### Issue: Signature mismatch

Verify:
1. ✅ Correct `RAZORPAY_KEY_SECRET`
2. ✅ Order ID & Payment ID are correct
3. ✅ HMAC algorithm is SHA-256
4. ✅ Order of string: `${order_id}|${payment_id}`

---

## 📱 Mobile Optimization

✅ Responsive design built-in
✅ Mobile payment methods:
  - UPI (Google Pay, PhonePe, Paytm)
  - Mobile wallets
  - Credit/Debit cards

---

## 🚀 Production Checklist

- [ ] Switch from test to live keys
- [ ] Update `RAZORPAY_KEY_ID` in production secrets
- [ ] Set correct pricing (₹99 or custom)
- [ ] Enable email QR code delivery
- [ ] Test with live payment
- [ ] Set up webhook for payment events
- [ ] Enable fraud detection
- [ ] Monitor payment failures
- [ ] Set up refund process

---

## 📞 Support

- **Razorpay Docs:** https://razorpay.com/docs
- **API Reference:** https://razorpay.com/api/#orders
- **Contact:** support@razorpay.com

---

## Comparison: Why Razorpay?

| Feature | Razorpay | Stripe | PayPal |
|---------|----------|--------|--------|
| **Lowest Cost** | 1.5% (UPI) | 2.9% | 2.9% |
| **India Support** | ✅ Best | ❌ Poor | ⚠️ Partial |
| **UPI/Wallets** | ✅ Yes | ❌ No | ❌ No |
| **Setup Time** | 5 mins | 30 mins | 20 mins |
| **User Base** | 200M+ | - | - |
| **Mobile First** | ✅ Yes | ⚠️ Partial | ✅ Yes |

**Razorpay is BEST for Indian events.**

---

## Next Steps

1. ✅ Create Razorpay account
2. ✅ Copy test credentials to .env.local
3. ✅ Deploy Edge Functions to Supabase
4. ✅ Test with test card numbers
5. ✅ Implement email QR delivery
6. ✅ Go live with production keys

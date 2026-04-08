# 🎫 Ticketing & Crowd-O-Meter Implementation Guide

## Overview

This implementation provides a complete real-time ticketing and crowd management system for Happenin events.

**Key Features:**
- ✅ Real-time crowd updates via Supabase Realtime (WebSocket)
- ✅ Debounced crowd updates (prevents spam)
- ✅ Secure ticketing with server-side QR code generation
- ✅ Time-bound, signed QR codes
- ✅ Mobile-first responsive UI
- ✅ Accurate crowd-o-meter (only counts checked-in attendees)

---

## Architecture

### Frontend (Completed)

```
src/
├── components/features/ticketing/
│   ├── CrowdOMeter.tsx          # Real-time crowd display
│   ├── TicketPurchase.tsx       # Ticket purchase form
│   ├── MyTickets.tsx            # User's tickets + check-in
│   └── EventDetail.tsx          # Complete event view
├── services/
│   ├── ticketService.ts         # Ticket operations
│   └── crowdService.ts          # Real-time crowd updates
└── hooks/
    └── useCrowd.ts              # Custom hooks for crowd data
```

### Backend (TODO - Supabase Edge Functions)

You MUST implement these Supabase Edge Functions:

1. **`purchase-ticket`** - Secure ticket purchase
2. **`check-in-ticket`** - QR code validation & check-in

---

## Component Guide

### 1. CrowdOMeter

**Purpose:** Display real-time crowd levels with visual indicators

**Props:**
```tsx
interface CrowdOMeterProps {
  eventId: string;
}
```

**Features:**
- Real-time updates via WebSocket (2-second debounce)
- Color-coded levels (empty → full)
- Percentage + attendance count
- Responsive design

**Usage:**
```tsx
import { CrowdOMeter } from '@/components/features/ticketing';

<CrowdOMeter eventId="event-123" />
```

---

### 2. TicketPurchase

**Purpose:** Sell tickets with secure backend payment processing

**Props:**
```tsx
interface TicketPurchaseProps {
  event: Event;
  userId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

**Features:**
- Quantity selector (1-10)
- Price calculation
- Backend validation
- Error handling

**Usage:**
```tsx
import { TicketPurchase } from '@/components/features/ticketing';

<TicketPurchase
  event={event}
  userId={user.id}
  onSuccess={() => alert('Ticket purchased!')}
/>
```

**⚠️ IMPORTANT:**
- Backend Edge Function validates:
  - Stock availability
  - User eligibility
  - Payment processing
  - QR code generation (signed JWT)

---

### 3. MyTickets

**Purpose:** Show user's purchased tickets with check-in capability

**Props:**
```tsx
interface MyTicketsProps {
  userId: string | null;
}
```

**Features:**
- List all user's tickets
- Check-in button (calls backend)
- Status indicator (pending/checked-in)
- QR code display

**Usage:**
```tsx
import { MyTickets } from '@/components/features/ticketing';

<MyTickets userId={user.id} />
```

---

### 4. EventDetail

**Purpose:** Complete event view with crowd + tickets

**Props:**
```tsx
interface EventDetailProps {
  event: Event;
  userId: string;
  onClose?: () => void;
}
```

**Usage:**
```tsx
import { EventDetail } from '@/components/features/ticketing';

<EventDetail 
  event={event}
  userId={user.id}
  onClose={() => setSelectedEvent(null)}
/>
```

---

## Service Guide

### ticketService.ts

**Functions:**

```typescript
// Purchase tickets (calls backend Edge Function)
purchaseTicket(request: TicketPurchaseRequest): Promise<Ticket[]>

// Get user's tickets
getUserTickets(userId: string): Promise<Ticket[]>

// Check in at event (backend validates QR)
checkInTicket(ticketId: string, qrCode: string): Promise<void>

// Get ticket count for event
getTicketCount(eventId: string): Promise<number>

// Get checked-in count
getCheckedInCount(eventId: string): Promise<number>

// Get current crowd
getCurrentCrowd(eventId: string): Promise<number>
```

---

### crowdService.ts

**Functions:**

```typescript
// Subscribe to real-time crowd updates (debounced)
subscribeToRealTimeCrowd(
  eventId: string,
  callback: (crowd: CrowdMetric) => void,
  debounceMs?: number
): () => void

// Fetch current crowd metric
getCrowdMetric(eventId: string): Promise<CrowdMetric>

// Get historical crowd data
getCrowdHistory(eventId: string, limit?: number): Promise<CrowdMetric[]>

// Get crowd level (empty/low/medium/high/full)
getCrowdLevel(percentage: number): 'empty' | 'low' | 'medium' | 'high' | 'full'

// Get color for crowd level
getCrowdLevelColor(percentage: number): string
```

---

## Hooks Guide

### useCrowd.ts

**Hook 1: useCrowd**
```typescript
const { crowd, loading, error } = useCrowd(eventId);
```
- Subscribes to real-time updates
- Auto-cleanup on unmount
- Debounced (2 sec default)

**Hook 2: useUserTickets**
```typescript
const { tickets, loading, error } = useUserTickets(userId);
```
- Fetches user's ticket list
- Re-fetches on userId change

**Hook 3: useRefreshCrowd**
```typescript
const { crowd, loading, refresh } = useRefreshCrowd(eventId);
```
- Manual crowd refresh trigger
- Useful for fallback polling

---

## Backend Requirements (TODO)

### 1. Supabase Edge Function: `purchase-ticket`

**Endpoint:** `POST /functions/v1/purchase-ticket`

**Request Body:**
```json
{
  "event_id": "string",
  "user_id": "string",
  "quantity": number,
  "price": number
}
```

**Validations (MUST do on backend):**
- ✅ User authenticated (check JWT)
- ✅ Event exists
- ✅ Sufficient stock (current_count + quantity <= capacity)
- ✅ Prevent duplicate purchases (rate limit)
- ✅ Process payment (Stripe/payment gateway)
- ✅ Generate signed QR codes:
  ```
  JWT Token: {
    "ticket_id": "string",
    "event_id": "string",
    "exp": now + 24 hours // Expires at event end
  }
  Sign with SUPABASE_JWT_SECRET
  ```

**Response:**
```json
{
  "tickets": [
    {
      "id": "ticket-123",
      "event_id": "event-456",
      "user_id": "user-789",
      "qr_code": "eyJhbG...",
      "qr_code_expires_at": "2026-04-09T12:00:00Z",
      "ticket_number": "TKT-001",
      "purchase_date": "2026-04-08T10:00:00Z"
    }
  ]
}
```

---

### 2. Supabase Edge Function: `check-in-ticket`

**Endpoint:** `POST /functions/v1/check-in-ticket`

**Request Body:**
```json
{
  "ticket_id": "string",
  "qr_code": "eyJhbG..."
}
```

**Validations (MUST do on backend):**
- ✅ Verify QR signature
- ✅ Check expiration (not expired)
- ✅ Check if already checked in
- ✅ Update `is_checked_in = true`
- ✅ Log check-in event

**Response:**
```json
{
  "success": true,
  "message": "Welcome to the event!",
  "checked_in_at": "2026-04-08T14:30:00Z"
}
```

---

### 3. Database Schema (SQL)

Make sure your Supabase tables have these fields:

```sql
-- Events table (should already exist)
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  max_capacity INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL,
  ticket_number VARCHAR UNIQUE NOT NULL,
  qr_code TEXT NOT NULL, -- Signed JWT
  qr_code_expires_at TIMESTAMP NOT NULL,
  is_checked_in BOOLEAN DEFAULT false,
  purchase_date TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Crowd metrics table (optional, for historical tracking)
CREATE TABLE crowd_metrics (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  current_count INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  percentage DECIMAL NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_is_checked_in ON tickets(is_checked_in);
```

---

### 4. Row Level Security (RLS)

**Apply to `tickets` table:**

```sql
-- Users can see only their own tickets
CREATE POLICY "Users see their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tickets (via Edge Function)
CREATE POLICY "Users can purchase tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only backend Edge Function can update is_checked_in
CREATE POLICY "Only backend can check in"
  ON tickets FOR UPDATE
  USING (false); -- Direct updates blocked, use Edge Function
```

---

## Real-time Flow Diagram

```
User purchases ticket
    ↓
TicketPurchase component calls purchaseTicket()
    ↓
Backend Edge Function (purchase-ticket)
  - Validates stock
  - Generates signed QR code
  - Creates ticket record
    ↓
Database notifies Supabase Realtime
    ↓
crowdService subscribes to postgres_changes
    ↓
Debounce timer (2 sec)
    ↓
getCrowdMetric() fetches new count
    ↓
useCrowd hook updates state
    ↓
CrowdOMeter component re-renders with 📊 new data
```

---

## Security Checklist

- ✅ **QR Codes:** Signed JWT tokens (backend-generated)
- ✅ **Expiration:** Time-bound (expires at event end)
- ✅ **Validation:** Backend-only (no client-side trust)
- ✅ **RLS:** Row-level security on tickets table
- ✅ **Payment:** Processed server-side only
- ✅ **Rate Limiting:** Prevent spam purchases
- ✅ **Logging:** Track all check-ins for compliance

---

## Testing Checklist

- [ ] Purchase ticket flow
- [ ] QR code generation & validation
- [ ] Real-time crowd updates
- [ ] Check-in at event
- [ ] Duplicate check-in prevention
- [ ] Expired QR code rejection
- [ ] Mobile responsiveness
- [ ] WebSocket reconnection (fallback polling)

---

## Next Steps

1. **Create Supabase Edge Functions** (`purchase-ticket`, `check-in-ticket`)
2. **Set up database schema** with RLS policies
3. **Replace sample data** in components with real database
4. **Add auth integration** (login/signup)
5. **Implement QR code modal** in MyTickets
6. **Add payment processing** (Stripe integration)
7. **Test real-time updates** with multiple users
8. **Deploy to production** (Vercel → Supabase)

---

## Environment Variables

Add to `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_test_...  # Optional for payments
```

---

## Performance Notes

- **WebSocket:** Supabase Realtime uses WebSockets (no polling overhead)
- **Debouncing:** 2-second batching prevents high-frequency updates
- **Indexes:** Database indexes on `event_id`, `user_id`, `is_checked_in`
- **Caching:** Consider Redis for crowd metrics if scale > 10k events

---

## Mobile Optimization

- ✅ Responsive design (Tailwind CSS)
- ✅ Touch-friendly buttons (48px+ tap targets)
- ✅ QR code scanner integration (TODO: add camera library)
- ✅ Offline fallback (TODO: service worker)

---

## References

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc7519)
- [Rules.md](../../rules.md) - Engineering rules
- [Skills.md](../../skills.md) - Required skills

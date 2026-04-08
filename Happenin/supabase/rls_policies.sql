-- Happenin RLS policies
-- Run in Supabase SQL Editor.

-- Enable RLS
alter table public.events enable row level security;
alter table public.tickets enable row level security;
alter table public.crowd_metrics enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payments enable row level security;

-- EVENTS
-- Everyone can read events.
drop policy if exists "events_select_public" on public.events;
create policy "events_select_public"
on public.events
for select
to anon, authenticated
using (true);

-- Only authenticated users can create events.
drop policy if exists "events_insert_authenticated" on public.events;
create policy "events_insert_authenticated"
on public.events
for insert
to authenticated
with check (true);

-- Optional: allow event updates/deletes only for service-role flows.
-- Keep disabled in client-side apps unless you track ownership.

-- TICKETS
-- Users can only read their own tickets.
drop policy if exists "tickets_select_own" on public.tickets;
create policy "tickets_select_own"
on public.tickets
for select
to authenticated
using (auth.uid() = user_id);

-- Ticket writes should be done by Edge Functions/service role.

-- CROWD METRICS
-- Everyone can read crowd metrics for public event pages.
drop policy if exists "crowd_metrics_select_public" on public.crowd_metrics;
create policy "crowd_metrics_select_public"
on public.crowd_metrics
for select
to anon, authenticated
using (true);

-- Crowd metric writes should be service-role only via backend jobs/Edge Functions.
drop policy if exists "crowd_metrics_insert_authenticated" on public.crowd_metrics;
drop policy if exists "crowd_metrics_update_authenticated" on public.crowd_metrics;

-- PAYMENT ORDERS
-- Authenticated users can read only their own orders.
drop policy if exists "payment_orders_select_own" on public.payment_orders;
create policy "payment_orders_select_own"
on public.payment_orders
for select
to authenticated
using (auth.uid() = user_id);

-- PAYMENTS
-- Authenticated users can read only their own payments.
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);

-- Writes to payment_orders/payments should be service-role only via Edge Functions.

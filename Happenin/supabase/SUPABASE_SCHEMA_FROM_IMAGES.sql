-- Supabase schema inferred from project docs and code.
-- Tables: events, tickets, crowd_metrics, payment_orders, payments

create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  location text not null,
  latitude numeric not null,
  longitude numeric not null,
  max_capacity int4 not null,
  image_url text null,
  created_at timestamp null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null,
  ticket_number varchar not null unique,
  qr_code text not null,
  qr_code_expires_at timestamp not null,
  is_checked_in bool null default false,
  purchase_date timestamp null default now(),
  updated_at timestamp null default now()
);

create table if not exists public.crowd_metrics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  current_count int4 not null default 0,
  capacity int4 not null,
  percentage numeric not null default 0,
  updated_at timestamp null default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id varchar not null unique,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null,
  quantity int4 not null,
  amount int4 not null,
  status varchar not null default 'created',
  notes jsonb,
  created_at timestamp null default now(),
  updated_at timestamp null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id varchar not null references public.payment_orders(razorpay_order_id),
  razorpay_payment_id varchar not null unique,
  user_id uuid not null,
  event_id uuid not null references public.events(id) on delete cascade,
  amount int4 not null,
  quantity int4 not null,
  status varchar not null default 'success',
  verified_at timestamp not null,
  created_at timestamp null default now()
);

create index if not exists idx_tickets_event_id on public.tickets(event_id);
create index if not exists idx_tickets_user_id on public.tickets(user_id);
create unique index if not exists idx_crowd_metrics_event_id on public.crowd_metrics(event_id);
create index if not exists idx_events_created_at on public.events(created_at desc);
create index if not exists idx_payment_orders_event_id on public.payment_orders(event_id);
create index if not exists idx_payment_orders_user_id on public.payment_orders(user_id);
create index if not exists idx_payment_orders_status on public.payment_orders(status);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_event_id on public.payments(event_id);

-- Optional helper function for updated_at management.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Recompute and upsert crowd metrics for one event.
create or replace function public.refresh_crowd_metric_for_event(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  event_capacity int4;
  checked_in_count int4;
  computed_percentage numeric;
begin
  if target_event_id is null then
    return;
  end if;

  select max_capacity
  into event_capacity
  from public.events
  where id = target_event_id;

  if event_capacity is null then
    return;
  end if;

  select count(*)::int4
  into checked_in_count
  from public.tickets
  where event_id = target_event_id
    and is_checked_in = true;

  event_capacity := greatest(event_capacity, 1);
  checked_in_count := greatest(coalesce(checked_in_count, 0), 0);
  computed_percentage := least(100, round((checked_in_count::numeric / event_capacity::numeric) * 100));

  insert into public.crowd_metrics (event_id, current_count, capacity, percentage, updated_at)
  values (target_event_id, checked_in_count, event_capacity, computed_percentage, now())
  on conflict (event_id)
  do update set
    current_count = excluded.current_count,
    capacity = excluded.capacity,
    percentage = excluded.percentage,
    updated_at = now();
end;
$$;

create or replace function public.sync_crowd_metric_from_tickets_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_crowd_metric_for_event(old.event_id);
    return old;
  end if;

  perform public.refresh_crowd_metric_for_event(new.event_id);

  if tg_op = 'UPDATE' and old.event_id is distinct from new.event_id then
    perform public.refresh_crowd_metric_for_event(old.event_id);
  end if;

  return new;
end;
$$;

create or replace function public.sync_crowd_metric_from_events_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_crowd_metric_for_event(new.id);
  return new;
end;
$$;

drop trigger if exists trg_tickets_set_updated_at on public.tickets;
create trigger trg_tickets_set_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();

drop trigger if exists trg_crowd_metrics_set_updated_at on public.crowd_metrics;
create trigger trg_crowd_metrics_set_updated_at
before update on public.crowd_metrics
for each row
execute function public.set_updated_at();

drop trigger if exists trg_tickets_sync_crowd_metrics on public.tickets;
create trigger trg_tickets_sync_crowd_metrics
after insert or update of is_checked_in, event_id or delete on public.tickets
for each row
execute function public.sync_crowd_metric_from_tickets_trigger();

drop trigger if exists trg_events_sync_crowd_metrics on public.events;
create trigger trg_events_sync_crowd_metrics
after insert or update of max_capacity on public.events
for each row
execute function public.sync_crowd_metric_from_events_trigger();

drop trigger if exists trg_payment_orders_set_updated_at on public.payment_orders;
create trigger trg_payment_orders_set_updated_at
before update on public.payment_orders
for each row
execute function public.set_updated_at();

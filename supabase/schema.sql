-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Services
create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  duration_minutes int not null,
  price_cents int not null,
  category text not null,
  description text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Providers (pet care specialists instead of stylists)
create table providers (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text,
  bio text,
  specialty_tags text[] default '{}',
  profile_photo_url text,
  calendar_color text default '#7C3AED',
  booking_status text not null default 'accepting_all' check (booking_status in ('accepting_all', 'referral_only', 'closed')),
  active boolean default true,
  created_at timestamptz default now()
);

-- Provider working hours
create table provider_working_hours (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  is_working boolean default true
);

-- Clients
create table clients (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  pet_name text,
  pet_type text,
  pet_notes text,
  payment_method_id text, -- generic, works with any payment processor
  payment_customer_id text, -- generic, works with any payment processor
  created_at timestamptz default now()
);

-- Appointments
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  provider_id uuid references providers(id),
  service_id uuid references services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed', 'no_show')),
  referred_by_name text,
  how_did_you_hear text,
  inspiration_photo_url text,
  payment_method_id text,
  notes text,
  booking_ref text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_appointments_starts_at on appointments(starts_at);
create index idx_appointments_provider on appointments(provider_id, starts_at);
create index idx_clients_email on clients(email);
create index idx_clients_phone on clients(phone);

-- Enable Row Level Security
alter table services enable row level security;
alter table providers enable row level security;
alter table provider_working_hours enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;

-- Public read policies for booking flow
create policy "Public can read active services" on services for select using (active = true);
create policy "Public can read active providers" on providers for select using (active = true);
create policy "Public can read working hours" on provider_working_hours for select using (true);

-- Insert policies for booking flow (anon can create bookings)
create policy "Public can insert clients" on clients for insert with check (true);
create policy "Public can read own client by email" on clients for select using (true);
create policy "Public can insert appointments" on appointments for insert with check (true);
create policy "Public can read own appointments" on appointments for select using (true);

-- Seed data for Gabriela's Premier Pet Care
insert into services (name, duration_minutes, price_cents, category, description, sort_order) values
  ('Drop-in Visit (30 min)', 30, 2500, 'Drop-in Visits', 'In-home visit for feeding, potty breaks, playtime, and companionship.', 1),
  ('Drop-in Visit (60 min)', 60, 4500, 'Drop-in Visits', 'Extended in-home visit with feeding, walks, playtime, and extra TLC.', 2),
  ('Dog Walking', 30, 2500, 'Dog Walking', 'Daily walk to keep your dog active, healthy, and happy.', 3),
  ('Overnight Pet Sitting', 720, 7500, 'Overnight Care', 'Overnight stay to ensure your pet feels safe and comfortable through the night.', 4),
  ('Meet & Greet', 30, 0, 'Consultation', 'Free consultation to meet your pet and discuss care needs.', 0);

insert into providers (first_name, last_name, bio, specialty_tags, booking_status) values
  ('Gabriela', 'Aguilar', 'Owner and lead pet care specialist. Animal lover with years of experience caring for pets of all sizes and personalities.', ARRAY['Dogs', 'Cats', 'Overnight Care', 'All Pets'], 'accepting_all');

-- Insert working hours for Gabriela (Mon-Sat, 8am-6pm)
insert into provider_working_hours (provider_id, day_of_week, start_time, end_time, is_working)
select p.id, d.day, '08:00'::time, '18:00'::time, true
from providers p, generate_series(1, 6) as d(day)
where p.first_name = 'Gabriela';

-- Sunday off
insert into provider_working_hours (provider_id, day_of_week, start_time, end_time, is_working)
select p.id, 0, '08:00'::time, '18:00'::time, false
from providers p
where p.first_name = 'Gabriela';
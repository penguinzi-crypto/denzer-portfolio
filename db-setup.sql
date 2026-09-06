-- ============================================
-- Denzer Portfolio — Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  tags text not null default '',
  video_id text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- PUBLIC: Anyone can read projects (your portfolio is public)
create policy "Public read access"
  on public.projects for select
  using (true);

-- ADMIN ONLY: Insert — hardcoded email, cannot be changed from client code
create policy "Admin insert"
  on public.projects for insert
  with check (auth.jwt() ->> 'email' = 'denzermmolina@gmail.com');

-- ADMIN ONLY: Update
create policy "Admin update"
  on public.projects for update
  using (auth.jwt() ->> 'email' = 'denzermmolina@gmail.com');

-- ADMIN ONLY: Delete
create policy "Admin delete"
  on public.projects for delete
  using (auth.jwt() ->> 'email' = 'denzermmolina@gmail.com');

-- Auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_projects_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- Seed with your current projects
insert into public.projects (title, tags, video_id, sort_order) values
  ('Interactive Web App', 'JavaScript · Python · HTML/CSS', 'dQw4w9WgXcQ', 0),
  ('Roblox Game Engine', 'Lua · Roblox · Game Dev', '9bZkp7q19f0', 1),
  ('Desktop Application', 'C# · .NET · Desktop', 'kJQP7kiw5Fk', 2),
  ('Automation Suite', 'Python · Automation · API', 'JGwWNGJdvx8', 3),
  ('Portfolio Website', 'HTML · CSS · JavaScript', 'RgKAFK5djSk', 4),
  ('Game UI System', 'Lua · UI/UX · Roblox', 'OPf0YbXqDm0', 5),
  ('API Dashboard', 'Node.js · REST · Dashboard', 'fJ9rUzIMcZQ', 6),
  ('Data Visualizer', 'Python · Charts · Analytics', 'hT_nvWreIhg', 7);

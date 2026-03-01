-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  name text,
  bio text,
  location text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Pitches
create table public.pitches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles, -- Removed NOT NULL
  problem text not null,
  solution text not null,
  video_url text not null,
  thumbnail_url text,
  industry text,
  stage text,
  created_at timestamptz default now()
);

-- Votes (unique per user per pitch)
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid references public.pitches on delete cascade,
  user_id uuid references public.profiles,
  type text check (type in ('up','down')),
  created_at timestamptz default now()
  -- Removed unique constraint for Guest MVP to simplify, but can add back with IP hashing later
);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid references public.pitches on delete cascade,
  user_id uuid references public.profiles,
  role text,
  text text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.pitches enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Users can delete own profile." on public.profiles for delete using (auth.uid() = id);

create policy "Pitches are viewable by everyone." on public.pitches for select using (true);
create policy "Anyone can insert pitches for frictionless MVP." on public.pitches for insert with check (true);
create policy "Users can delete own pitches." on public.pitches for delete using (auth.uid() = user_id);

create policy "Votes are viewable by everyone." on public.votes for select using (true);
create policy "Anyone can insert votes for frictionless MVP." on public.votes for insert with check (true);
create policy "Users can delete own votes." on public.votes for delete using (auth.uid() = user_id);

create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Anyone can insert comments for frictionless MVP." on public.comments for insert with check (true);
create policy "Users can delete own comments." on public.comments for delete using (auth.uid() = user_id);

-- Handles user signup syncing automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

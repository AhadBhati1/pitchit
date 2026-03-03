-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO EXPAND FOUNDER PROFILES

-- 1. Add new fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS startup_name text,
ADD COLUMN IF NOT EXISTS startup_website text,
ADD COLUMN IF NOT EXISTS founder_linkedin text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 2. Update existing accounts to be marked as completed (optional, if you want current users to skip)
-- UPDATE public.profiles SET onboarding_completed = true WHERE onboarding_completed IS FALSE;

-- 3. Success message
SELECT 'Profiles table successfully expanded with startup and onboarding fields' as status;


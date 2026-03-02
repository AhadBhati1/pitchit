-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX DATA FETCHING & DELETION ERRORS

-- 1. FIX PROFILES TABLE (Ensure it links to Auth)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 2. FIX PITCHES TABLE (Link directly to Profiles for easy joins)
ALTER TABLE public.pitches
DROP CONSTRAINT IF EXISTS pitches_user_id_fkey,
ADD CONSTRAINT pitches_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 3. FIX VOTES TABLE
ALTER TABLE public.votes
DROP CONSTRAINT IF EXISTS votes_user_id_fkey,
ADD CONSTRAINT votes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 4. FIX COMMENTS TABLE
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey,
ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Success message
SELECT 'Relationships updated to support joins and cascade deletes' as status;

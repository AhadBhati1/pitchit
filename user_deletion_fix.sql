-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX USER DELETION ERRORS
-- This script adds "ON DELETE CASCADE" to your foreign keys, 
-- allowing you to delete users from the Auth dashboard without database errors.

-- 1. FIX PROFILES TABLE
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 2. FIX PITCHES TABLE
ALTER TABLE public.pitches
DROP CONSTRAINT IF EXISTS pitches_user_id_fkey,
ADD CONSTRAINT pitches_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
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
SELECT 'Foreign keys updated to ON DELETE CASCADE' as status;

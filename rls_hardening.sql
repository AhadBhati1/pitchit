-- DROP OLD GUEST POLICIES
DROP POLICY IF EXISTS "Anyone can insert pitches for frictionless MVP." ON public.pitches;
DROP POLICY IF EXISTS "Anyone can insert votes for frictionless MVP." ON public.votes;
DROP POLICY IF EXISTS "Anyone can insert comments for frictionless MVP." ON public.comments;

-- ADD HARDENED PRODUCTION POLICIES
-- Only authenticated users can submit pitches
CREATE POLICY "Authenticated users can insert pitches." ON public.pitches
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can vote
CREATE POLICY "Authenticated users can insert votes." ON public.votes
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can comment
CREATE POLICY "Authenticated users can insert comments." ON public.comments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure users can only update/delete their own data (Standard RLS)
-- These are already in the main schema, but good to ensure:
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

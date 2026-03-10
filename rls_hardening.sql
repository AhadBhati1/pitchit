-- DROP OLD GUEST POLICIES
DROP POLICY IF EXISTS "Anyone can insert pitches for frictionless MVP." ON public.pitches;
DROP POLICY IF EXISTS "Anyone can insert votes for frictionless MVP." ON public.votes;
DROP POLICY IF EXISTS "Anyone can insert comments for frictionless MVP." ON public.comments;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- CLEAN UP EXISTING ORPHANED PITCHES
-- We must delete pitches without a user before we can enforce the NOT NULL constraint to avoid ERROR 23502.
DELETE FROM public.pitches WHERE user_id IS NULL;

-- ENSURE user_id ON PITCHES IS NOT NULL
ALTER TABLE public.pitches ALTER COLUMN user_id SET NOT NULL;

-- ADD HARDENED PRODUCTION POLICIES

-- PITCHES
DROP POLICY IF EXISTS "Authenticated users can insert pitches." ON public.pitches;
CREATE POLICY "Authenticated users can insert pitches." ON public.pitches
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pitches." ON public.pitches;
CREATE POLICY "Users can update own pitches." ON public.pitches
FOR UPDATE USING (auth.uid() = user_id);

-- VOTES
DROP POLICY IF EXISTS "Authenticated users can insert votes." ON public.votes;
CREATE POLICY "Authenticated users can insert votes." ON public.votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes." ON public.votes;
CREATE POLICY "Users can update own votes." ON public.votes
FOR UPDATE USING (auth.uid() = user_id);

-- COMMENTS
DROP POLICY IF EXISTS "Authenticated users can insert comments." ON public.comments;
CREATE POLICY "Authenticated users can insert comments." ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments." ON public.comments;
CREATE POLICY "Users can update own comments." ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

-- PROFILES
CREATE POLICY "Users can update own profile." ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

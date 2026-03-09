-- DROP OLD GUEST POLICIES
DROP POLICY IF EXISTS "Anyone can insert pitches for frictionless MVP." ON public.pitches;
DROP POLICY IF EXISTS "Anyone can insert votes for frictionless MVP." ON public.votes;
DROP POLICY IF EXISTS "Anyone can insert comments for frictionless MVP." ON public.comments;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- ENSURE user_id ON PITCHES IS NOT NULL
ALTER TABLE public.pitches ALTER COLUMN user_id SET NOT NULL;

-- ADD HARDENED PRODUCTION POLICIES

-- PITCHES
CREATE POLICY "Authenticated users can insert pitches." ON public.pitches
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitches." ON public.pitches
FOR UPDATE USING (auth.uid() = user_id);

-- VOTES
CREATE POLICY "Authenticated users can insert votes." ON public.votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes." ON public.votes
FOR UPDATE USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "Authenticated users can insert comments." ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments." ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

-- PROFILES
CREATE POLICY "Users can update own profile." ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

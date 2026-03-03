-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE "RELATIONSHIP" ERROR

-- 1. Create the comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  role text DEFAULT 'Viewer',
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. ENSURE THE FOREIGN KEY IS EXPLICITLY NAMED (This is what our API uses)
DO $$ 
BEGIN
    -- Remove the old one if it exists to clean up
    ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
    
    -- Add the new explicit one
    ALTER TABLE public.comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE;
END $$;

-- 3. Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments for frictionless MVP." ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments." ON public.comments;

-- 5. Create proper policies
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments for frictionless MVP." ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 6. GRANT PERMISSIONS (Just in case)
GRANT ALL ON public.comments TO authenticated, anon;

-- 7. RELOAD POSTGREST CACHE (Critical fix for "Relationship not found")
NOTIFY pgrst, 'reload schema';

-- 8. Success Check
SELECT 'Comments relationship explicitly named and schema cache reloaded!' as status;

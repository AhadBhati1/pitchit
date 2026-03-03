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

-- 2. ENSURE THE FOREIGN KEY EXISTS (This fixes the join error)
-- We try to add the constraint. It will fail if it exists, which is fine.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name='comments' AND constraint_name='comments_user_id_fkey'
    ) THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments for frictionless MVP." ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments." ON public.comments;

-- 5. Create proper policies
CREATE POLICY "Comments are viewable by everyone." ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments for frictionless MVP." ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own comments." ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- 6. RELOAD POSTGREST CACHE (Critical fix for "Relationship not found")
NOTIFY pgrst, 'reload schema';

-- 7. Success Check
SELECT 'Comments relationship fixed and schema cache reloaded!' as status;

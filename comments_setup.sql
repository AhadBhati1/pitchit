-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO ACTIVATE COMMENTS

-- 1. Create the comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  role text DEFAULT 'Viewer',
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments for frictionless MVP." ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments." ON public.comments;

-- 4. Create proper policies
CREATE POLICY "Comments are viewable by everyone." ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments for frictionless MVP." ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own comments." ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Success Check
SELECT 'Comments table and RLS policies successfully connected' as status;

-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    bot_id TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create storyboard_sessions table
CREATE TABLE public.storyboard_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    concept TEXT,
    target_duration INTEGER,
    num_shots INTEGER,
    config JSONB DEFAULT '{}'::jsonb,
    assets JSONB DEFAULT '[]'::jsonb,
    shots JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyboard_sessions ENABLE ROW LEVEL SECURITY;

-- Create Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
    ON public.chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
    ON public.chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
    ON public.chat_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
    ON public.chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Create Policies for storyboard_sessions
CREATE POLICY "Users can view their own storyboard sessions"
    ON public.storyboard_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storyboard sessions"
    ON public.storyboard_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storyboard sessions"
    ON public.storyboard_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storyboard sessions"
    ON public.storyboard_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Create Storage Bucket 'generated_assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated_assets', 'generated_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated_assets');

-- 2. Allow users to update their own assets (optional)
CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- 3. Allow public read access (since we set public=true)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated_assets');

-- 4. Allow users to delete their own assets
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);

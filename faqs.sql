-- CREATE TABLE FOR FAQS IN SUPABASE
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES TO SECURE FAQS SO USERS CAN ONLY ACCESS THEIR OWN DATA

-- 1. Select Policy: Users can view only their own FAQs
CREATE POLICY "Users can view their own FAQs" 
    ON public.faqs 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Insert Policy: Users can insert their own FAQs
CREATE POLICY "Users can insert their own FAQs" 
    ON public.faqs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. Update Policy: Users can update their own FAQs
CREATE POLICY "Users can update their own FAQs" 
    ON public.faqs 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Delete Policy: Users can delete their own FAQs
CREATE POLICY "Users can delete their own FAQs" 
    ON public.faqs 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- COMMENT ON TABLE FOR DOCUMENTATION
COMMENT ON TABLE public.faqs IS 'Stores client-specific FAQs used by AI Receptionist';

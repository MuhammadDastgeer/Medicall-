-- CREATE TABLE FOR SERVICES IN SUPABASE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "durationMinutes" INTEGER DEFAULT 60,
    "priceType" TEXT NOT NULL DEFAULT 'Fixed Price',
    price NUMERIC(10, 2) DEFAULT 0.00,
    "isActive" BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES TO SECURE SERVICES SO USERS CAN ONLY ACCESS THEIR OWN DATA

-- 1. Select Policy: Users can view only their own Services
CREATE POLICY "Users can view their own Services" 
    ON public.services 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Insert Policy: Users can insert their own Services
CREATE POLICY "Users can insert their own Services" 
    ON public.services 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. Update Policy: Users can update their own Services
CREATE POLICY "Users can update their own Services" 
    ON public.services 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Delete Policy: Users can delete their own Services
CREATE POLICY "Users can delete their own Services" 
    ON public.services 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- COMMENT ON TABLE FOR DOCUMENTATION
COMMENT ON TABLE public.services IS 'Stores user-specific services catalog elements authorized for AI Receptionist';

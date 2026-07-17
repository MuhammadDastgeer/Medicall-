-- CREATE TABLE FOR PATIENTS IN SUPABASE
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    vehicle TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES TO SECURE PATIENTS SO USERS CAN ONLY ACCESS THEIR OWN DATA

-- 1. Select Policy: Users can view only their own Patients
CREATE POLICY "Users can view their own Patients" 
    ON public.patients 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Insert Policy: Users can insert their own Patients
CREATE POLICY "Users can insert their own Patients" 
    ON public.patients 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. Update Policy: Users can update their own Patients
CREATE POLICY "Users can update their own Patients" 
    ON public.patients 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Delete Policy: Users can delete their own Patients
CREATE POLICY "Users can delete their own Patients" 
    ON public.patients 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- COMMENT ON TABLE FOR DOCUMENTATION
COMMENT ON TABLE public.patients IS 'Stores user-specific patients database for the clinic';

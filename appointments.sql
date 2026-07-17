-- CREATE TABLE FOR APPOINTMENTS IN SUPABASE
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "vehicleYear" TEXT NOT NULL DEFAULT '2021',
    "vehicleMake" TEXT NOT NULL DEFAULT 'Toyota',
    "vehicleModel" TEXT NOT NULL DEFAULT 'Camry',
    "serviceId" TEXT NOT NULL,
    "scheduledAt" TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES TO SECURE APPOINTMENTS SO USERS CAN ONLY ACCESS THEIR OWN DATA

-- 1. Select Policy: Users can view only their own Appointments
CREATE POLICY "Users can view their own Appointments" 
    ON public.appointments 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Insert Policy: Users can insert their own Appointments
CREATE POLICY "Users can insert their own Appointments" 
    ON public.appointments 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. Update Policy: Users can update their own Appointments
CREATE POLICY "Users can update their own Appointments" 
    ON public.appointments 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Delete Policy: Users can delete their own Appointments
CREATE POLICY "Users can delete their own Appointments" 
    ON public.appointments 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- COMMENT ON TABLE FOR DOCUMENTATION
COMMENT ON TABLE public.appointments IS 'Stores user-specific appointments booked via manual admin or AI receptionist dialer';

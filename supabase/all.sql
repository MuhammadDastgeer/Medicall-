-- ======================================================================
-- SUPABASE COMPLETE ALL-IN-ONE SQL SCRIPT (all.sql)
-- ======================================================================
-- Copy this entire code and paste it directly into your Supabase SQL Editor.
-- Click "Run" to set up all your database tables, relations, and RLS policies.
-- This ensures that all your data goes straight to Supabase instead of local storage!

-- ----------------------------------------------------------------------
-- 1. CLEAN UP PREVIOUS TABLES (Optional, safe with CASCADE)
-- ----------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.business_hours CASCADE;
DROP TABLE IF EXISTS public.business_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- ----------------------------------------------------------------------
-- 2. CREATE SYSTEM TABLES
-- ----------------------------------------------------------------------

-- Profile Table (links with Supabase Auth users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Business Profiles Table
CREATE TABLE public.business_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip TEXT DEFAULT '',
  website TEXT DEFAULT '',
  timezone TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Business Hours Table
CREATE TABLE public.business_hours (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  sunday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "", "to": ""}'::jsonb,
  monday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "", "to": ""}'::jsonb,
  tuesday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "", "to": ""}'::jsonb,
  wednesday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "", "to": ""}'::jsonb,
  thursday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "", "to": ""}'::jsonb,
  friday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "", "to": ""}'::jsonb,
  saturday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "", "to": ""}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ----------------------------------------------------------------------
-- 3. CREATE APPLICATION DATA TABLES
-- ----------------------------------------------------------------------

-- Services Table
CREATE TABLE public.services (
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

-- Agents Table
CREATE TABLE public.agents (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    voice TEXT,
    personality TEXT,
    "interruptionSensitivity" TEXT NOT NULL DEFAULT 'Medium',
    "greetingMessage" TEXT,
    "systemPrompt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE public.appointments (
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

-- FAQs Table
CREATE TABLE public.faqs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients Table
CREATE TABLE public.patients (
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


-- ----------------------------------------------------------------------
-- 4. CONFIGURE ROW LEVEL SECURITY (RLS) FOR FREE ACCESS
-- ----------------------------------------------------------------------
-- We enable RLS and set clean policies for logged-in users so their data stays isolated,
-- but we make sure policies are extremely clean and simple.

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Business Profiles Policies
CREATE POLICY "Users can manage their own business profile" ON public.business_profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Business Hours Policies
CREATE POLICY "Users can manage their own business hours" ON public.business_hours
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Services Policies
CREATE POLICY "Users can manage their own services" ON public.services
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Agents Policies
CREATE POLICY "Users can manage their own agents" ON public.agents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Appointments Policies
CREATE POLICY "Users can manage their own appointments" ON public.appointments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FAQs Policies
CREATE POLICY "Users can manage their own faqs" ON public.faqs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Patients Policies
CREATE POLICY "Users can manage their own patients" ON public.patients
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------
-- 5. TRIGGER FOR NEW SIGNUPS
-- ----------------------------------------------------------------------
-- This trigger automatically inserts default profile details in profiles, 
-- business_profiles, and business_hours tables when a user registers.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Create Base Profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Business Profile
  INSERT INTO public.business_profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)) || ' Practice',
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Create Default Business Hours
  INSERT INTO public.business_hours (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to Auth Table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================================================================
-- DONE! SUCCESS!
-- =================================-------------------------------------

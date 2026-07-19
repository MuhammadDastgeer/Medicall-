-- ======================================================================
-- SUPABASE COMPLETE MASTER DATABASE SCHEMA & DDL SETUP
-- ======================================================================
-- Copy and run this script inside your Supabase SQL Editor to set up 
-- ALL tables, Row-Level Security (RLS) policies, and auth triggers.
-- This ensures full data persistence for all modules.

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Business Profiles Table
CREATE TABLE IF NOT EXISTS public.business_profiles (
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

-- 3. Create Business Hours Table
CREATE TABLE IF NOT EXISTS public.business_hours (
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

-- Enable Row-Level Security (RLS) on Base Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
CREATE POLICY "Allow users to read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to delete their own profile" ON public.profiles;
CREATE POLICY "Allow users to delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Business Profiles Policies
DROP POLICY IF EXISTS "Allow users to read their own business profile" ON public.business_profiles;
CREATE POLICY "Allow users to read their own business profile" ON public.business_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own business profile" ON public.business_profiles;
CREATE POLICY "Allow users to update their own business profile" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert their own business profile" ON public.business_profiles;
CREATE POLICY "Allow users to insert their own business profile" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to delete their own business profile" ON public.business_profiles;
CREATE POLICY "Allow users to delete their own business profile" ON public.business_profiles
  FOR DELETE USING (auth.uid() = id);

-- Business Hours Policies
DROP POLICY IF EXISTS "Allow users to read their own business hours" ON public.business_hours;
CREATE POLICY "Allow users to read their own business hours" ON public.business_hours
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own business hours" ON public.business_hours;
CREATE POLICY "Allow users to update their own business hours" ON public.business_hours
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert their own business hours" ON public.business_hours;
CREATE POLICY "Allow users to insert their own business hours" ON public.business_hours
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to delete their own business hours" ON public.business_hours;
CREATE POLICY "Allow users to delete their own business hours" ON public.business_hours
  FOR DELETE USING (auth.uid() = id);

-- Trigger to automatically create profiles and default entries when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into Profiles
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New Member')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into Business Profiles
  INSERT INTO public.business_profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New Member'),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into Business Hours
  INSERT INTO public.business_hours (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function to auth.users signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ======================================================================
-- 5. Create Services Table
-- ======================================================================
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

-- Enable Row-Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create Policies for Services
DROP POLICY IF EXISTS "Users can view their own Services" ON public.services;
CREATE POLICY "Users can view their own Services" ON public.services 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own Services" ON public.services;
CREATE POLICY "Users can insert their own Services" ON public.services 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own Services" ON public.services;
CREATE POLICY "Users can update their own Services" ON public.services 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own Services" ON public.services;
CREATE POLICY "Users can delete their own Services" ON public.services 
    FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.services IS 'Stores user-specific services catalog elements authorized for AI Receptionist';


-- ======================================================================
-- 6. Create Agents Table
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.agents (
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

-- Enable Row-Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Create Policies for Agents
DROP POLICY IF EXISTS "Users can view their own Agents" ON public.agents;
CREATE POLICY "Users can view their own Agents" ON public.agents 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own Agents" ON public.agents;
CREATE POLICY "Users can insert their own Agents" ON public.agents 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own Agents" ON public.agents;
CREATE POLICY "Users can update their own Agents" ON public.agents 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own Agents" ON public.agents;
CREATE POLICY "Users can delete their own Agents" ON public.agents 
    FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.agents IS 'Stores user-specific AI agents for medical clinical roles';


-- ======================================================================
-- 7. Create Appointments Table
-- ======================================================================
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

-- Enable Row-Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create Policies for Appointments
DROP POLICY IF EXISTS "Users can view their own Appointments" ON public.appointments;
CREATE POLICY "Users can view their own Appointments" ON public.appointments 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own Appointments" ON public.appointments;
CREATE POLICY "Users can insert their own Appointments" ON public.appointments 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own Appointments" ON public.appointments;
CREATE POLICY "Users can update their own Appointments" ON public.appointments 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own Appointments" ON public.appointments;
CREATE POLICY "Users can delete their own Appointments" ON public.appointments 
    FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.appointments IS 'Stores user-specific appointments booked';


-- ======================================================================
-- 8. Create FAQs Table
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create Policies for FAQs
DROP POLICY IF EXISTS "Users can view their own FAQs" ON public.faqs;
CREATE POLICY "Users can view their own FAQs" ON public.faqs 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own FAQs" ON public.faqs;
CREATE POLICY "Users can insert their own FAQs" ON public.faqs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own FAQs" ON public.faqs;
CREATE POLICY "Users can update their own FAQs" ON public.faqs 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own FAQs" ON public.faqs;
CREATE POLICY "Users can delete their own FAQs" ON public.faqs 
    FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.faqs IS 'Stores client-specific FAQs used by AI Receptionist';


-- ======================================================================
-- 9. Create Patients Table
-- ======================================================================
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

-- Enable Row-Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create Policies for Patients
DROP POLICY IF EXISTS "Users can view their own Patients" ON public.patients;
CREATE POLICY "Users can view their own Patients" ON public.patients 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own Patients" ON public.patients;
CREATE POLICY "Users can insert their own Patients" ON public.patients 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own Patients" ON public.patients;
CREATE POLICY "Users can update their own Patients" ON public.patients 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own Patients" ON public.patients;
CREATE POLICY "Users can delete their own Patients" ON public.patients 
    FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.patients IS 'Stores user-specific patients database';

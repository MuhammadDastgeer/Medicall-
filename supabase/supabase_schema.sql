-- ==========================================
-- SUPABASE DATABASE SCHEMA & DDL SETUP
-- ==========================================
-- Copy and run this script in your Supabase SQL Editor to set up the tables,
-- Row-Level Security (RLS) policies, and automatic profile triggers.

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
  timezone TEXT DEFAULT 'New York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Business Hours Table
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  sunday JSONB NOT NULL DEFAULT '{"isOpen": false, "from": "09:00 AM", "to": "05:00 PM"}'::jsonb,
  monday JSONB NOT NULL DEFAULT '{"isOpen": true, "from": "08:00 AM", "to": "06:00 PM"}'::jsonb,
  tuesday JSONB NOT NULL DEFAULT '{"isOpen": true, "from": "08:00 AM", "to": "06:00 PM"}'::jsonb,
  wednesday JSONB NOT NULL DEFAULT '{"isOpen": true, "from": "08:00 AM", "to": "06:00 PM"}'::jsonb,
  thursday JSONB NOT NULL DEFAULT '{"isOpen": true, "from": "08:00 AM", "to": "06:00 PM"}'::jsonb,
  friday JSONB NOT NULL DEFAULT '{"isOpen": true, "from": "08:00 AM", "to": "06:00 PM"}'::jsonb,
  saturday JSONB NOT NULL DEFAULT '{"isOpen": true, "from": "09:00 AM", "to": "02:00 PM"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Create Security Policies

-- Profiles Policies
CREATE POLICY "Allow users to read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Business Profiles Policies
CREATE POLICY "Allow users to read their own business profile" ON public.business_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own business profile" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own business profile" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Business Hours Policies
CREATE POLICY "Allow users to read their own business hours" ON public.business_hours
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own business hours" ON public.business_hours
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own business hours" ON public.business_hours
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create trigger to automatically create profiles and default entries when a user signs up
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
    COALESCE(new.raw_user_meta_data->>'business_name', 'AutoCare Pro Clinic'),
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

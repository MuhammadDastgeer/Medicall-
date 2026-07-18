-- CREATE TABLE FOR AGENTS IN SUPABASE
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

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES TO SECURE AGENTS SO USERS CAN ONLY ACCESS THEIR OWN DATA

-- 1. Select Policy: Users can view only their own Agents
CREATE POLICY "Users can view their own Agents" 
    ON public.agents 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Insert Policy: Users can insert their own Agents
CREATE POLICY "Users can insert their own Agents" 
    ON public.agents 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. Update Policy: Users can update their own Agents
CREATE POLICY "Users can update their own Agents" 
    ON public.agents 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Delete Policy: Users can delete their own Agents
CREATE POLICY "Users can delete their own Agents" 
    ON public.agents 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- COMMENT ON TABLE FOR DOCUMENTATION
COMMENT ON TABLE public.agents IS 'Stores user-specific AI agents for medical clinical roles';

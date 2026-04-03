-- Step 1: Update Profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'SEEKER' CHECK (user_type IN ('SEEKER', 'GUARDIAN'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_code_expires_at TIMESTAMPTZ;

-- Step 2: Create Guardian Links table
CREATE TABLE IF NOT EXISTS guardian_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seeker_id UUID REFERENCES auth.users(id) NOT NULL,
  guardian_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seeker_id, guardian_id)
);

-- Step 3: Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  content TEXT,
  target_id UUID, -- ID for the related entity (e.g. link_id)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: RLS Policies
ALTER TABLE guardian_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own links" ON guardian_links
  FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = guardian_id);

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Step 5: Realtime Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

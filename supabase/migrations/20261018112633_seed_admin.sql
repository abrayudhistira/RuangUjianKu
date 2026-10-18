-- Seed Admin User
-- This migration creates an admin user with email: adminambarsan@gmail.com
-- Password will be set via Supabase Auth (use Supabase Dashboard or API to set password)
-- After running this, you need to:
-- 1. Create the auth user in Supabase Dashboard -> Authentication -> Users -> Add User
--    Email: adminambarsan@gmail.com, Password: adminambarsan, Auto confirm: ON
-- 2. Copy the generated User ID (UUID) and run the UPDATE below with that UUID
--    OR use the DO block below which handles it automatically

-- Option A: If auth user already exists, update role to admin
-- Run this AFTER creating the user in Supabase Auth Dashboard
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to find the user by email in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'adminambarsan@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- User exists in auth, ensure profile exists and set role to admin
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (admin_user_id, 'adminambarsan@gmail.com', 'admin', 'Admin Ambarsan')
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      full_name = 'Admin Ambarsan',
      updated_at = NOW();

    RAISE NOTICE 'Admin user updated: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Auth user not found. Create user first in Supabase Dashboard -> Authentication -> Users -> Add User';
    RAISE NOTICE 'Email: adminambarsan@gmail.com, Password: adminambarsan, Auto confirm: ON';
  END IF;
END $$;

-- Option B: Alternative - Create auth user via SQL (requires service_role key, not recommended for production)
-- This is commented out because it requires service_role and bypasses normal auth flow
-- Uncomment and run via Supabase SQL Editor with service_role if needed:
/*
SELECT auth.admin_create_user(
  'adminambarsan@gmail.com',
  'adminambarsan',
  '{"full_name": "Admin Ambarsan"}'::jsonb,
  true  -- auto_confirm
);
*/
# Supabase Migration & Seeding Guide

## Migrations Created

1. **`20261018112444_initial_schema.sql`** - Complete database schema:
   - `users` table (extends auth.users)
   - `exams` table
   - `questions` table
   - `exam_attempts` table
   - `answers` table
   - RLS policies
   - Triggers for auto-profile creation & updated_at

2. **`20261018112633_seed_admin.sql`** - Admin user seeding

---

## How to Apply

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Run `20261018112444_initial_schema.sql` first
3. Run `20261018112633_seed_admin.sql` second

### Option B: Via Supabase CLI (if you have access)

```bash
npx supabase db push
```

---

## Creating Admin User (adminambarsan@gmail.com)

**Important:** The seed migration **cannot create auth users** directly via SQL (security restriction). You must create the auth user first, then the migration will promote it to admin.

### Step 1: Create Auth User in Supabase Dashboard

1. **Authentication** → **Users** → **Add User**
2. Fill in:
   - **Email**: `adminambarsan@gmail.com`
   - **Password**: `adminambarsan`
   - **Auto Confirm**: ✅ ON
3. Click **Create User**
4. Copy the **User ID (UUID)** that's generated

### Step 2: Run Seed Migration

After creating the auth user, run `20261018112633_seed_admin.sql` in SQL Editor. The DO block will:
- Find the user by email
- Create/update profile in `public.users`
- Set `role = 'admin'`

### Step 3: Verify

In **Table Editor** → `users` table, you should see:
| id | email | role | full_name |
|---|---|---|---|
| <uuid> | adminambarsan@gmail.com | admin | Admin Ambarsan |

---

## Login as Admin

1. Go to `/admin/login`
2. Email: `adminambarsan@gmail.com`
3. Password: `adminambarsan`
4. Should redirect to `/admin` dashboard

---

## Troubleshooting

**Migration fails with "relation does not exist"**: Run initial schema first.

**Admin not working**: Check `public.users` table has `role = 'admin'` for that email.

**Auth user not found error**: Create auth user in Dashboard first, then run seed migration.

**Password not working**: Make sure "Auto Confirm" was ON when creating user, or confirm email via link.
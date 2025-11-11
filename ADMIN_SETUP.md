# Admin Setup Instructions

## Creating the Super Admin

The super admin account `dev@dotmini.in.th` with password `arsenal56` has been automatically configured.

### First-Time Login Steps

1. Visit `/auth` on your website
2. Login with:
   - Email: `dev@dotmini.in.th`
   - Password: `arsenal56`
3. You'll be redirected to `/admin` dashboard

**Note**: If this is the first login and the account doesn't exist yet:

1. Go to `/auth` page and manually create an account with:
   - Email: `dev@dotmini.in.th`
   - Password: `arsenal56`

2. Then run this SQL in the backend Database interface:
   ```sql
   -- Get the user_id for dev@dotmini.in.th
   SELECT id FROM auth.users WHERE email = 'dev@dotmini.in.th';
   
   -- Replace <USER_ID> with the actual user_id from above query
   INSERT INTO public.user_roles (user_id, role, role_title)
   VALUES ('<USER_ID>', 'super_admin', 'Super Administrator');
   ```

## Accessing Admin Dashboard

1. Go to `/auth` page
2. Login with: `dev@dotmini.in.th` / `arsenal56`
3. You'll be redirected to `/admin`

## Admin Features

### Applications Management
- View all submitted applications
- Search and filter by status
- Update application status (pending/reviewing/approved/rejected)
- Download CV files

### User Management (Super Admin Only)
- Add new admin users
- Assign roles:
  - **Super Admin**: Full access, can manage other admins
  - **Vice President**: Can view and manage applications
  - **Admin**: Can view and manage applications
- Remove admin users

## Security Notes

- Super admin credentials are stored securely in the database
- All admin routes are protected with authentication checks
- RLS policies ensure proper access control
- Roles are stored in a separate table (not in profiles) to prevent privilege escalation

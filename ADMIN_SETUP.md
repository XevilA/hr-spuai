# HR@SPU AI CLUB - Admin Setup Guide

## 🔐 Super Admin Account

The system is configured to automatically create a super admin when the following email signs up:

**Email:** `dev@dotmini.in.th`  
**Password:** `arsenal56`

## 📝 First-Time Setup

### Step 1: Create Super Admin Account

1. Go to your website's `/auth` page
2. Enter the credentials:
   - Email: `dev@dotmini.in.th`
   - Password: `arsenal56`
3. Click "Login" (this will create the account if it doesn't exist)
4. The super_admin role will be automatically assigned via database trigger
5. You'll be redirected to the `/admin` dashboard

### Step 2: Access Admin Dashboard

After logging in, you can access the admin dashboard at `/admin` where you can:

#### 📋 Applications Management
- View all member applications
- Search by name, email, or nickname
- Filter by status (pending/reviewing/approved/rejected)
- Update application status
- Download CV files

#### 👥 User Management (Super Admin Only)
- Add new admin users
- Assign different roles:
  - **Super Admin**: Full access, can manage other admins
  - **Vice President**: Can view and manage applications
  - **Admin**: Can view and manage applications
- Set custom role titles (e.g., "VP of Developer", "VP of Content Creator")
- Remove admin users

## 🎯 Adding Additional Admins

As a super admin, you can add other administrators:

1. Go to `/admin` → "User Management" tab
2. Click "Add Admin"
3. Fill in:
   - Email address
   - Password (minimum 6 characters)
   - Role (super_admin, vice_president, or admin)
   - Role Title (optional, e.g., "VP of Developer")
4. Click "Add Admin"

The new admin can then login at `/auth` with their credentials.

## 🔒 Security Features

- ✅ Secure authentication with Supabase Auth
- ✅ Row-Level Security (RLS) policies on all tables
- ✅ Roles stored in separate table (prevents privilege escalation)
- ✅ Security definer functions for role checking
- ✅ Auto-confirm email enabled (for testing)
- ✅ Protected admin routes

## 📱 Application Form Features

The public application form (`/#signup`) includes:
- Multi-step form with progress indicator
- File upload for CVs (PDF, DOCX, JPG/PNG max 10MB)
- Character counter for motivation field
- Real-time validation
- Confetti animation on successful submission
- Automatic email collection

## 🎨 Branding

The site is branded as **HR@SPU AI CLUB** throughout:
- Hero section
- Footer
- Admin dashboard
- Application form
- All marketing materials

## 📊 Application Status Workflow

Recommended workflow for managing applications:

1. **Pending** (default) - New applications
2. **Reviewing** - Currently under review
3. **Approved** - Accepted members
4. **Rejected** - Not accepted

## 🚀 Quick Access Links

- **Public Site**: `/`
- **Application Form**: `/#signup`
- **Admin Login**: `/auth`
- **Admin Dashboard**: `/admin`

## 💡 Tips

- Keep the super admin password secure
- Regularly review and update application statuses
- Download CVs before making final decisions
- Use role titles to clarify responsibilities
- Only grant super_admin role to trusted individuals

## 🆘 Troubleshooting

**Can't login as super admin?**
- Make sure you're using the correct email: `dev@dotmini.in.th`
- Password is case-sensitive: `arsenal56`
- Try clearing browser cache and cookies

**Not seeing admin dashboard after login?**
- Check that the super_admin role was assigned
- Go to backend → Database → user_roles table to verify

**Other admins can't login?**
- Verify they were added through the User Management interface
- Check they have a valid role assigned
- Ensure they're using the correct credentials

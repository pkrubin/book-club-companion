# How to Restrict Access (Invite Only)

To ensure only people you know can access the app, follow these steps:

## Step 1: Add Users Manually
Instead of letting people sign up themselves, you will create accounts for them.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Click on the **Authentication** icon (left sidebar).
3.  Click on **Users** (inner sidebar).
4.  Click the **Add User** button (top right).
5.  Enter their **Email address**.
6.  Choose "Auto Confirm User?" -> **ON** (so they don't need to verify email).
7.  Enter a **Password** for them (you will have to tell them this password, they can't change it easily in this simple app yet).
8.  Click **Invite User** (or "Create User").

## Step 2: Disable Public Signups
This prevents strangers from creating accounts even if they find your site.

1.  In the **Authentication** section, click on **Providers** -> **Email**.
2.  Toggle **OFF** "Enable Signups".
3.  Click **Save**.

Now, only the email/password combinations you manually created will work!

# Supabase Authentication Setup

The code for logging in is **already included** in your `index.html` file!

However, by default, Supabase requires you to **confirm your email address** before you can log in. To make it easier for your book club members (so they can log in immediately after signing up), I recommend disabling this setting.

## How to Disable Email Confirmation

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Click on the **Authentication** icon in the left sidebar (looks like a users group).
3.  Click on **Providers** in the inner sidebar.
4.  Click on **Email** to expand the settings.
5.  **Toggle OFF** "Confirm email".
6.  Click **Save**.

## How to Test It

1.  Refresh your `index.html` page.
2.  Click **Sign Up** (bottom of the form).
3.  Enter a fake email (e.g., `test@bookclub.com`) and a password.
4.  Click **Sign Up**.
    - *If you disabled email confirmation*: You will be logged in immediately!
    - *If you kept it on*: You need to go to that email inbox and click the link.

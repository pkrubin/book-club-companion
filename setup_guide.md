# Supabase Database Setup Guide

Since you already have your Supabase project URL and API Key, you just need to create the table to store the books.

## Step 1: Log in to Supabase
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and log in.
2. Select your project (the one matching `rqbtntzqqkekdzvfilos`).

## Step 2: Open the SQL Editor
1. On the left sidebar, click on the **SQL Editor** icon (it looks like a terminal prompt `>_`).
2. Click **New Query**.

## Step 3: Run the Schema Script
1. Copy the entire content of the `supabase_schema.sql` file I created in your folder.
2. Paste it into the SQL Editor in Supabase.
3. Click the **Run** button (bottom right of the editor).

## Step 4: Verify
1. Go to the **Table Editor** (icon looks like a table grid) on the left sidebar.
2. You should see a new table named `book_club_list`.
3. It should have columns: `id`, `created_at`, `title`, `author`, `google_data`.

## Step 5: Test the App
1. Refresh your `index.html` page.
2. Log in (if not already).
3. Search for a book and click "Save".
4. It should now work!

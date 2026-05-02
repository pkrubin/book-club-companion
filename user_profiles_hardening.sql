begin;

-- Goal:
-- 1. Signed-in users may create only their own profile row.
-- 2. Self-created profiles must remain members.
-- 3. Signed-in users may update only display_name on their own row.
-- 4. Signed-in users may not update role, id, created_at, or last_seen_at directly.
-- 5. The app may still update last_seen_at through a trusted RPC.
--
-- Important rollout note:
-- Apply the matching app-code change first so the browser switches from
-- direct last_seen_at writes to the touch_user_last_seen() RPC below.
-- Otherwise older clients will start getting permission errors when they
-- try to update that field directly.

drop policy if exists "Allow profile creation" on public.user_profiles;
create policy "Allow profile creation"
    on public.user_profiles
    for insert
    to authenticated
    with check (
        auth.uid() = id
        and coalesce(role, 'member') = 'member'
    );

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
    on public.user_profiles
    for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

revoke update on table public.user_profiles from authenticated;
grant update (display_name) on public.user_profiles to authenticated;

create or replace function public.touch_user_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.user_profiles
    set last_seen_at = timezone('utc'::text, now())
    where id = auth.uid();
end;
$$;

revoke all on function public.touch_user_last_seen() from public;
grant execute on function public.touch_user_last_seen() to authenticated;

commit;

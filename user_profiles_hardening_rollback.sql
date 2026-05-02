begin;

-- Roll back the immediate user_profiles hardening change by restoring the
-- broad update privilege and the looser insert policy.

drop function if exists public.touch_user_last_seen();

drop policy if exists "Allow profile creation" on public.user_profiles;
create policy "Allow profile creation"
    on public.user_profiles
    for insert
    to authenticated
    with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
    on public.user_profiles
    for update
    to authenticated
    using (auth.uid() = id);

grant update on table public.user_profiles to authenticated;

commit;

begin;

-- Public RLS hardening for Supabase Security Advisor findings.
--
-- Review before running. This project uses one shared Supabase database for
-- test and prod, so applying this affects both environments immediately.
--
-- Covered Security Advisor entities:
-- - public.club_settings
-- - public.clubs
-- - public.club_memberships
-- - public.user_preferences
-- - public.platform_roles
-- - public.club_invites
-- - public.club_invite_consumptions

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.platform_roles
        where user_id = (select auth.uid())
          and role = 'owner'
    );
$$;

create or replace function public.is_any_club_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.club_memberships
        where user_id = (select auth.uid())
          and status = 'active'
          and role in ('admin', 'manager')
    )
    or exists (
        select 1
        from public.user_profiles
        where id = (select auth.uid())
          and role = 'admin'
    )
    or public.is_platform_owner();
$$;

create or replace function public.is_active_club_member(target_club_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.club_memberships
        where club_id = target_club_id
          and user_id = (select auth.uid())
          and status = 'active'
    )
    or public.is_platform_owner();
$$;

create or replace function public.can_manage_club(target_club_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.club_memberships
        where club_id = target_club_id
          and user_id = (select auth.uid())
          and status = 'active'
          and role in ('admin', 'manager')
    )
    or public.is_platform_owner();
$$;

revoke all on function public.is_platform_owner() from public;
revoke all on function public.is_any_club_admin() from public;
revoke all on function public.is_active_club_member(bigint) from public;
revoke all on function public.can_manage_club(bigint) from public;

grant execute on function public.is_platform_owner() to authenticated;
grant execute on function public.is_any_club_admin() to authenticated;
grant execute on function public.is_active_club_member(bigint) to authenticated;
grant execute on function public.can_manage_club(bigint) to authenticated;

alter table public.clubs enable row level security;
alter table public.club_settings enable row level security;
alter table public.club_memberships enable row level security;
alter table public.user_preferences enable row level security;
alter table public.platform_roles enable row level security;
alter table public.club_invites enable row level security;
alter table public.club_invite_consumptions enable row level security;

create index if not exists idx_club_memberships_user_status
    on public.club_memberships (user_id, status);

create index if not exists idx_club_memberships_club_user_status
    on public.club_memberships (club_id, user_id, status);

create index if not exists idx_user_preferences_user
    on public.user_preferences (user_id);

create index if not exists idx_platform_roles_user_role
    on public.platform_roles (user_id, role);

create index if not exists idx_club_invites_club
    on public.club_invites (club_id);

create index if not exists idx_club_invite_consumptions_invite
    on public.club_invite_consumptions (invite_id);

create index if not exists idx_club_invite_consumptions_club
    on public.club_invite_consumptions (club_id);

create index if not exists idx_club_invite_consumptions_user
    on public.club_invite_consumptions (user_id);

-- clubs
drop policy if exists "Members can read their clubs" on public.clubs;
create policy "Members can read their clubs"
    on public.clubs
    for select
    to authenticated
    using (
        public.is_active_club_member(id)
        or created_by = (select auth.uid())
    );

drop policy if exists "Club admins can create sandbox clubs" on public.clubs;
create policy "Club admins can create sandbox clubs"
    on public.clubs
    for insert
    to authenticated
    with check (
        (select auth.uid()) is not null
        and created_by = (select auth.uid())
        and (
            club_type = 'sandbox'
            or public.is_platform_owner()
        )
        and public.is_any_club_admin()
    );

drop policy if exists "Club managers can update clubs" on public.clubs;
create policy "Club managers can update clubs"
    on public.clubs
    for update
    to authenticated
    using (public.can_manage_club(id))
    with check (public.can_manage_club(id));

drop policy if exists "Platform owners can delete clubs" on public.clubs;
create policy "Platform owners can delete clubs"
    on public.clubs
    for delete
    to authenticated
    using (public.is_platform_owner());

-- club_settings
drop policy if exists "Members can read club settings" on public.club_settings;
create policy "Members can read club settings"
    on public.club_settings
    for select
    to authenticated
    using (public.is_active_club_member(club_id));

drop policy if exists "Club creators and managers can create settings" on public.club_settings;
create policy "Club creators and managers can create settings"
    on public.club_settings
    for insert
    to authenticated
    with check (
        updated_by = (select auth.uid())
        and (
            public.can_manage_club(club_id)
            or exists (
                select 1
                from public.clubs
                where id = club_id
                  and created_by = (select auth.uid())
            )
        )
    );

drop policy if exists "Club managers can update settings" on public.club_settings;
create policy "Club managers can update settings"
    on public.club_settings
    for update
    to authenticated
    using (public.can_manage_club(club_id))
    with check (public.can_manage_club(club_id));

drop policy if exists "Club managers can delete settings" on public.club_settings;
create policy "Club managers can delete settings"
    on public.club_settings
    for delete
    to authenticated
    using (public.can_manage_club(club_id));

-- club_memberships
drop policy if exists "Users and club managers can read memberships" on public.club_memberships;
create policy "Users and club managers can read memberships"
    on public.club_memberships
    for select
    to authenticated
    using (
        user_id = (select auth.uid())
        or public.can_manage_club(club_id)
    );

drop policy if exists "Club creators and managers can add memberships" on public.club_memberships;
create policy "Club creators and managers can add memberships"
    on public.club_memberships
    for insert
    to authenticated
    with check (
        public.can_manage_club(club_id)
        or (
            user_id = (select auth.uid())
            and created_by = (select auth.uid())
            and role in ('admin', 'manager')
            and status = 'active'
            and exists (
                select 1
                from public.clubs
                where id = club_id
                  and created_by = (select auth.uid())
            )
        )
    );

drop policy if exists "Club managers can update memberships" on public.club_memberships;
create policy "Club managers can update memberships"
    on public.club_memberships
    for update
    to authenticated
    using (public.can_manage_club(club_id))
    with check (public.can_manage_club(club_id));

drop policy if exists "Club managers can delete memberships" on public.club_memberships;
create policy "Club managers can delete memberships"
    on public.club_memberships
    for delete
    to authenticated
    using (public.can_manage_club(club_id));

-- user_preferences
drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences"
    on public.user_preferences
    for select
    to authenticated
    using (user_id = (select auth.uid()));

drop policy if exists "Users can create own preferences" on public.user_preferences;
create policy "Users can create own preferences"
    on public.user_preferences
    for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and (
            active_club_id is null
            or public.is_active_club_member(active_club_id)
        )
    );

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
    on public.user_preferences
    for update
    to authenticated
    using (user_id = (select auth.uid()))
    with check (
        user_id = (select auth.uid())
        and (
            active_club_id is null
            or public.is_active_club_member(active_club_id)
        )
    );

drop policy if exists "Users can delete own preferences" on public.user_preferences;
create policy "Users can delete own preferences"
    on public.user_preferences
    for delete
    to authenticated
    using (user_id = (select auth.uid()));

-- platform_roles
drop policy if exists "Users can read own platform role" on public.platform_roles;
create policy "Users can read own platform role"
    on public.platform_roles
    for select
    to authenticated
    using (
        user_id = (select auth.uid())
        or public.is_platform_owner()
    );

-- No browser-client write policies for platform_roles. Manage platform owners
-- through trusted SQL/admin tooling only.

-- club_invites
drop policy if exists "Club managers can read invites" on public.club_invites;
create policy "Club managers can read invites"
    on public.club_invites
    for select
    to authenticated
    using (public.can_manage_club(club_id));

drop policy if exists "Club managers can create invites" on public.club_invites;
create policy "Club managers can create invites"
    on public.club_invites
    for insert
    to authenticated
    with check (
        created_by = (select auth.uid())
        and public.can_manage_club(club_id)
    );

drop policy if exists "Club managers can update invites" on public.club_invites;
create policy "Club managers can update invites"
    on public.club_invites
    for update
    to authenticated
    using (public.can_manage_club(club_id))
    with check (public.can_manage_club(club_id));

drop policy if exists "Club managers can delete invites" on public.club_invites;
create policy "Club managers can delete invites"
    on public.club_invites
    for delete
    to authenticated
    using (public.can_manage_club(club_id));

-- club_invite_consumptions
drop policy if exists "Users and club managers can read invite consumptions" on public.club_invite_consumptions;
create policy "Users and club managers can read invite consumptions"
    on public.club_invite_consumptions
    for select
    to authenticated
    using (
        user_id = (select auth.uid())
        or public.can_manage_club(club_id)
    );

-- No direct browser-client write policies for invite consumptions. Invite
-- redemption should be handled by a trusted RPC or server-side action so users
-- cannot forge consumption rows or exhaust invite limits.

commit;

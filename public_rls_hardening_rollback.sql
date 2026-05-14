begin;

-- Emergency rollback for public_rls_hardening.sql.
--
-- This reopens the Security Advisor finding by disabling RLS on the seven
-- public tables. Use only if the app is blocked after applying the forward
-- migration and no safer targeted policy fix is immediately available.

drop policy if exists "Members can read their clubs" on public.clubs;
drop policy if exists "Club admins can create sandbox clubs" on public.clubs;
drop policy if exists "Club managers can update clubs" on public.clubs;
drop policy if exists "Platform owners can delete clubs" on public.clubs;

drop policy if exists "Members can read club settings" on public.club_settings;
drop policy if exists "Club creators and managers can create settings" on public.club_settings;
drop policy if exists "Club managers can update settings" on public.club_settings;
drop policy if exists "Club managers can delete settings" on public.club_settings;

drop policy if exists "Users and club managers can read memberships" on public.club_memberships;
drop policy if exists "Club creators and managers can add memberships" on public.club_memberships;
drop policy if exists "Club managers can update memberships" on public.club_memberships;
drop policy if exists "Club managers can delete memberships" on public.club_memberships;

drop policy if exists "Users can read own preferences" on public.user_preferences;
drop policy if exists "Users can create own preferences" on public.user_preferences;
drop policy if exists "Users can update own preferences" on public.user_preferences;
drop policy if exists "Users can delete own preferences" on public.user_preferences;

drop policy if exists "Users can read own platform role" on public.platform_roles;

drop policy if exists "Club managers can read invites" on public.club_invites;
drop policy if exists "Club managers can create invites" on public.club_invites;
drop policy if exists "Club managers can update invites" on public.club_invites;
drop policy if exists "Club managers can delete invites" on public.club_invites;

drop policy if exists "Users and club managers can read invite consumptions" on public.club_invite_consumptions;

alter table public.clubs disable row level security;
alter table public.club_settings disable row level security;
alter table public.club_memberships disable row level security;
alter table public.user_preferences disable row level security;
alter table public.platform_roles disable row level security;
alter table public.club_invites disable row level security;
alter table public.club_invite_consumptions disable row level security;

drop function if exists public.can_manage_club(bigint);
drop function if exists public.is_active_club_member(bigint);
drop function if exists public.is_any_club_admin();
drop function if exists public.is_platform_owner();

commit;

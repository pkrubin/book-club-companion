-- Multi-club foundation rollback
--
-- Use only if the multi-club foundation rollout must be removed before
-- club-scoped app behavior goes live. This drops the new foundation tables,
-- helper functions, triggers, indexes, and club_id columns.

begin;

drop trigger if exists trg_set_default_schedule_changes_club_id on public.schedule_changes;
drop trigger if exists trg_set_default_book_club_list_club_id on public.book_club_list;

drop function if exists public.set_default_schedule_changes_club_id();
drop function if exists public.set_default_book_club_list_club_id();
drop function if exists public.get_default_single_club_id();

drop index if exists public.idx_schedule_changes_club_id_created_at;
drop index if exists public.idx_book_club_list_club_id_status;
drop index if exists public.idx_book_club_list_club_id;
drop index if exists public.idx_club_memberships_user_id;

alter table public.schedule_changes
    drop column if exists club_id;

alter table public.book_club_list
    drop column if exists club_id;

drop table if exists public.user_preferences;
drop table if exists public.club_invites;
drop table if exists public.platform_roles;
drop table if exists public.club_memberships;
drop table if exists public.club_settings;
drop table if exists public.clubs;

commit;

-- Read-only preflight checks for public RLS hardening.
--
-- Safe to run in Supabase SQL Editor. This file does not change persistent data.
-- It uses temp tables only, and it is safe even when some expected tables do not exist.
-- Run this before public_rls_hardening.sql.

select
    current_database() as database_name,
    current_user as sql_user,
    now() as checked_at;

create temp table if not exists rls_expected_tables (
    table_name text primary key
) on commit drop;

truncate rls_expected_tables;

insert into rls_expected_tables (table_name)
values
    ('clubs'),
    ('club_settings'),
    ('club_memberships'),
    ('user_preferences'),
    ('platform_roles'),
    ('club_invites'),
    ('club_invite_consumptions'),
    ('book_club_list'),
    ('schedule_changes'),
    ('user_profiles'),
    ('invite_codes');

-- 1. Existence and RLS state.
select
    expected.table_name,
    case when actual.tablename is null then false else true end as table_exists,
    actual.rowsecurity as rls_enabled
from rls_expected_tables expected
left join pg_tables actual
    on actual.schemaname = 'public'
   and actual.tablename = expected.table_name
order by expected.table_name;

-- 2. Row counts for tables that exist. Missing tables are reported instead of crashing.
create temp table if not exists rls_row_counts (
    table_name text primary key,
    table_exists boolean not null,
    row_count bigint
) on commit drop;

truncate rls_row_counts;

do $$
declare
    table_record record;
    row_count bigint;
begin
    for table_record in
        select table_name
        from rls_expected_tables
        order by table_name
    loop
        if to_regclass(format('public.%I', table_record.table_name)) is null then
            insert into rls_row_counts (table_name, table_exists, row_count)
            values (table_record.table_name, false, null);
        else
            execute format('select count(*) from public.%I', table_record.table_name)
            into row_count;

            insert into rls_row_counts (table_name, table_exists, row_count)
            values (table_record.table_name, true, row_count);
        end if;
    end loop;
end $$;

select *
from rls_row_counts
order by table_name;

-- 3. Key column types for tables/columns that exist.
select
    c.table_name,
    c.column_name,
    c.data_type,
    c.udt_name,
    c.is_nullable
from information_schema.columns c
join rls_expected_tables expected
  on expected.table_name = c.table_name
where c.table_schema = 'public'
  and c.column_name in ('id', 'club_id', 'user_id', 'created_by', 'updated_by', 'active_club_id', 'invite_id')
order by c.table_name, c.ordinal_position;

-- 4. Existing policies on the seven Security Advisor tables, if any.
select
    p.schemaname,
    p.tablename,
    p.policyname,
    p.permissive,
    p.roles,
    p.cmd
from pg_policies p
where p.schemaname = 'public'
  and p.tablename in (
      'clubs',
      'club_settings',
      'club_memberships',
      'user_preferences',
      'platform_roles',
      'club_invites',
      'club_invite_consumptions'
  )
order by p.tablename, p.policyname;

-- 5. Conditional risk findings. These are only evaluated when the required
-- tables exist, so the script can run safely against old or different schemas.
create temp table if not exists rls_preflight_findings (
    severity text not null,
    finding text not null,
    details jsonb not null default '{}'::jsonb
) on commit drop;

truncate rls_preflight_findings;

do $$
begin
    insert into rls_preflight_findings (severity, finding, details)
    select
        'blocker',
        'missing_table',
        jsonb_build_object('table_name', expected.table_name)
    from rls_expected_tables expected
    where expected.table_name in (
        'clubs',
        'club_settings',
        'club_memberships',
        'user_preferences',
        'platform_roles',
        'club_invites',
        'club_invite_consumptions'
    )
      and to_regclass(format('public.%I', expected.table_name)) is null;

    if to_regclass('public.user_profiles') is not null
       and to_regclass('public.club_memberships') is not null then
        execute $query$
            insert into rls_preflight_findings (severity, finding, details)
            select
                'blocker',
                'user_without_active_membership',
                jsonb_build_object(
                    'user_id', up.id,
                    'display_name', up.display_name,
                    'legacy_role', up.role
                )
            from public.user_profiles up
            where not exists (
                select 1
                from public.club_memberships cm
                where cm.user_id = up.id
                  and cm.status = 'active'
            )
        $query$;
    end if;

    if to_regclass('public.user_preferences') is not null
       and to_regclass('public.club_memberships') is not null then
        execute $query$
            insert into rls_preflight_findings (severity, finding, details)
            select
                'blocker',
                'preference_points_to_inaccessible_club',
                jsonb_build_object(
                    'user_id', pref.user_id,
                    'active_club_id', pref.active_club_id
                )
            from public.user_preferences pref
            where pref.active_club_id is not null
              and not exists (
                  select 1
                  from public.club_memberships cm
                  where cm.user_id = pref.user_id
                    and cm.club_id = pref.active_club_id
                    and cm.status = 'active'
              )
        $query$;
    end if;

    if to_regclass('public.clubs') is not null
       and to_regclass('public.club_memberships') is not null then
        execute $query$
            insert into rls_preflight_findings (severity, finding, details)
            select
                'warning',
                'club_without_active_members',
                jsonb_build_object(
                    'club_id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'club_type', c.club_type,
                    'created_by', c.created_by
                )
            from public.clubs c
            where not exists (
                select 1
                from public.club_memberships cm
                where cm.club_id = c.id
                  and cm.status = 'active'
            )
        $query$;
    end if;

    if to_regclass('public.clubs') is not null
       and to_regclass('public.club_settings') is not null then
        execute $query$
            insert into rls_preflight_findings (severity, finding, details)
            select
                'warning',
                'club_missing_settings',
                jsonb_build_object(
                    'club_id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'club_type', c.club_type
                )
            from public.clubs c
            where not exists (
                select 1
                from public.club_settings cs
                where cs.club_id = c.id
            )
        $query$;
    end if;

    if to_regclass('public.club_memberships') is not null
       and to_regclass('public.clubs') is not null then
        execute $query$
            insert into rls_preflight_findings (severity, finding, details)
            select
                'blocker',
                'membership_points_to_missing_club',
                jsonb_build_object(
                    'club_id', cm.club_id,
                    'user_id', cm.user_id,
                    'role', cm.role,
                    'status', cm.status
                )
            from public.club_memberships cm
            left join public.clubs c on c.id = cm.club_id
            where cm.status = 'active'
              and c.id is null
        $query$;
    end if;
end $$;

select *
from rls_preflight_findings
order by
    case severity when 'blocker' then 1 when 'warning' then 2 else 3 end,
    finding,
    details::text;

-- 6. Admin/manager memberships. Confirm Pam appears here for the clubs she needs.
do $$
begin
    if to_regclass('public.club_memberships') is not null
       and to_regclass('public.clubs') is not null
       and to_regclass('public.user_profiles') is not null then
        create temp table if not exists rls_admin_memberships (
            club_id bigint,
            club_name text,
            user_id uuid,
            display_name text,
            legacy_role text,
            membership_role text,
            status text
        ) on commit drop;

        truncate rls_admin_memberships;

        execute $query$
            insert into rls_admin_memberships
            select
                cm.club_id,
                c.name as club_name,
                cm.user_id,
                up.display_name,
                up.role as legacy_role,
                cm.role as membership_role,
                cm.status
            from public.club_memberships cm
            left join public.clubs c on c.id = cm.club_id
            left join public.user_profiles up on up.id = cm.user_id
            where cm.status = 'active'
              and cm.role in ('admin', 'manager')
            order by c.name nulls last, up.display_name nulls last, cm.user_id
        $query$;
    end if;
end $$;

select *
from rls_admin_memberships
order by club_name nulls last, display_name nulls last, user_id;

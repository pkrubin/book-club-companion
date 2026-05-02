begin;

-- Goal:
-- 1. Stop authenticated browser clients from inserting arbitrary rows into schedule_changes.
-- 2. Create trusted schedule-change rows from book_club_list updates instead.
-- 3. Keep notification reads working for authenticated users.
--
-- Important rollout note:
-- Apply the matching app-code change first so the browser stops inserting
-- into schedule_changes directly. After that, apply this SQL so the DB
-- trigger becomes the single trusted writer.

create or replace function public.log_schedule_change_from_book_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    actor_name text;
begin
    if tg_op <> 'UPDATE' then
        return new;
    end if;

    if coalesce(old.status, '') <> 'Scheduled' and coalesce(new.status, '') <> 'Scheduled' then
        return new;
    end if;

    select nullif(btrim(display_name), '')
    into actor_name
    from public.user_profiles
    where id = auth.uid();

    actor_name := coalesce(actor_name, 'Unknown');

    if coalesce(old.host_name, '') is distinct from coalesce(new.host_name, '') then
        insert into public.schedule_changes (
            book_id,
            book_title,
            change_type,
            old_value,
            new_value,
            changed_by_name
        )
        values (
            new.id,
            new.title,
            'host',
            coalesce(old.host_name, '(none)'),
            coalesce(new.host_name, '(none)'),
            actor_name
        );
    end if;

    if coalesce(old.target_date::text, '') is distinct from coalesce(new.target_date::text, '') then
        insert into public.schedule_changes (
            book_id,
            book_title,
            change_type,
            old_value,
            new_value,
            changed_by_name
        )
        values (
            new.id,
            new.title,
            'date',
            coalesce(old.target_date::text, '(none)'),
            coalesce(new.target_date::text, '(none)'),
            actor_name
        );
    end if;

    if coalesce(old.meeting_time, '') is distinct from coalesce(new.meeting_time, '') then
        insert into public.schedule_changes (
            book_id,
            book_title,
            change_type,
            old_value,
            new_value,
            changed_by_name
        )
        values (
            new.id,
            new.title,
            'time',
            coalesce(old.meeting_time, '(none)'),
            coalesce(new.meeting_time, '(none)'),
            actor_name
        );
    end if;

    return new;
end;
$$;

drop trigger if exists trg_log_schedule_change_from_book_update on public.book_club_list;
create trigger trg_log_schedule_change_from_book_update
    after update on public.book_club_list
    for each row
    execute function public.log_schedule_change_from_book_update();

drop policy if exists "Allow insert for authenticated" on public.schedule_changes;
drop policy if exists "Authenticated users can insert schedule changes" on public.schedule_changes;

revoke insert, update, delete on table public.schedule_changes from authenticated;

commit;

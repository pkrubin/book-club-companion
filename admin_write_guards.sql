begin;

create or replace function public.is_book_club_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.user_profiles
        where id = auth.uid()
          and role = 'admin'
    );
$$;

revoke all on function public.is_book_club_admin() from public;
grant execute on function public.is_book_club_admin() to authenticated;

drop policy if exists "Enable delete for authenticated users" on public.book_club_list;
drop policy if exists "Enable delete for admins only" on public.book_club_list;
create policy "Enable delete for admins only"
    on public.book_club_list
    for delete
    to authenticated
    using (public.is_book_club_admin());

create or replace function public.enforce_book_club_list_member_writes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    member_allowed_columns text[] := array[
        'host_name',
        'target_date',
        'meeting_time',
        'user_notes',
        'tags',
        'rating',
        'rating_source',
        'rating_count',
        'google_data',
        'last_modified_by',
        'last_modified_at'
    ];
begin
    if public.is_book_club_admin() then
        return case when tg_op = 'DELETE' then old else new end;
    end if;

    if tg_op = 'DELETE' then
        raise exception 'Only admins can delete books.';
    end if;

    if tg_op = 'INSERT' then
        if new.status is not null and new.status <> 'Proposed' then
            raise exception 'Only admins can set a non-proposed book status during save.';
        end if;

        if coalesce(btrim(new.discussion_questions), '') <> '' then
            raise exception 'Only admins can create or overwrite the shared discussion guide.';
        end if;

        return new;
    end if;

    if new.google_data is distinct from old.google_data and old.google_data is not null then
        raise exception 'Only admins can replace stored book metadata.';
    end if;

    if (to_jsonb(new) - member_allowed_columns) is distinct from (to_jsonb(old) - member_allowed_columns) then
        raise exception 'Only admins can change shared workflow fields such as status, core book details, or discussion guides.';
    end if;

    return new;
end;
$$;

drop trigger if exists trg_enforce_book_club_list_member_writes on public.book_club_list;
create trigger trg_enforce_book_club_list_member_writes
    before insert or update or delete
    on public.book_club_list
    for each row
    execute function public.enforce_book_club_list_member_writes();

commit;

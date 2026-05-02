begin;

drop trigger if exists trg_log_schedule_change_from_book_update on public.book_club_list;
drop function if exists public.log_schedule_change_from_book_update();

create policy "Authenticated users can insert schedule changes"
    on public.schedule_changes
    for insert
    to authenticated
    with check (true);

grant insert on table public.schedule_changes to authenticated;

commit;

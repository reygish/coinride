create or replace function public.apply_transaction_xp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_today date := (now() at time zone 'utc')::date;
    v_yesterday date := (now() at time zone 'utc' - interval '1 day')::date;
    v_prev_streak int := 0;
    v_prev_xp numeric := 0;
    v_prev_level int := 1;
    v_prev_date date;
    v_next_streak int := 1;
    v_xp_gain int := 0;
    v_next_xp numeric := 0;
    v_next_level int := 1;
begin
    select
        coalesce(streak_count, 0),
        coalesce(total_xp, 0),
        coalesce(level, 1),
        last_streak_date
    into
        v_prev_streak,
        v_prev_xp,
        v_prev_level,
        v_prev_date
    from public.user_profiles
    where user_id = new.user_id;

    if v_prev_date = v_today then
        v_next_streak := greatest(v_prev_streak, 1);
    elsif v_prev_date = v_yesterday then
        v_next_streak := greatest(v_prev_streak + 1, 1);
    else
        v_next_streak := 1;
    end if;

    v_xp_gain := 10 * v_next_streak;
    v_next_xp := v_prev_xp + v_xp_gain;
    v_next_level := floor(v_next_xp / 1000) + 1;

    update public.user_profiles
    set
        total_xp = v_next_xp,
        level = v_next_level,
        streak_count = v_next_streak,
        last_streak_date = v_today
    where user_id = new.user_id;

    return new;
end;
$$;

-- Trigger:
drop trigger if exists trg_apply_transaction_xp on public.transactions;

create trigger trg_apply_transaction_xp
after insert on public.transactions
for each row
execute function public.apply_transaction_xp();
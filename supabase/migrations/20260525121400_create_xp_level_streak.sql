alter table public.user_profiles
    add column if not exists total_xp numeric(15,2) default 0,
    add column if not exists level integer default 1,
    add column if not exists streak_count integer default 0,
    add column if not exists last_streak_date date;
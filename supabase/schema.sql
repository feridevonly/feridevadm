-- FeriVault: simple Supabase-only setup. No service-role key and no API routes required.
create extension if not exists pgcrypto;

create table if not exists public.registration_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  enabled boolean not null default true,
  max_uses integer not null default 0,
  uses integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.signup_tokens (
  token uuid primary key default gen_random_uuid(),
  role text not null default 'user' check (role in ('user','admin')),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  used boolean not null default false
);

alter table public.registration_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.signup_tokens enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and banned=false); $$;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles for delete to authenticated using (public.is_admin());

drop policy if exists "referrals_admin_all" on public.registration_codes;
create policy "referrals_admin_all" on public.registration_codes for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "signup_tokens_none" on public.signup_tokens;
create policy "signup_tokens_none" on public.signup_tokens for all to authenticated using (false) with check (false);

create or replace function public.prepare_signup(p_code text)
returns table(signup_token uuid, role text)
language plpgsql security definer set search_path=public
as $$
declare r public.registration_codes%rowtype; t uuid;
begin
  select * into r from public.registration_codes where code=trim(p_code) and enabled=true and (max_uses=0 or uses<max_uses) for update;
  if not found then raise exception 'Kode referral tidak valid atau sudah habis'; end if;
  role := case when r.code='FERIDEVADM' then 'admin' else 'user' end;
  insert into public.signup_tokens(role) values(role) returning token into t;
  update public.registration_codes set uses=uses+1 where id=r.id;
  signup_token := t;
  return next;
end;
$$;
grant execute on function public.prepare_signup(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
declare st public.signup_tokens%rowtype;
begin
  select * into st from public.signup_tokens where token=(new.raw_user_meta_data->>'signup_token')::uuid and used=false and expires_at>now() for update;
  if found then
    insert into public.profiles(id,email,role) values(new.id,new.email,st.role) on conflict(id) do update set email=excluded.email, role=excluded.role;
    update public.signup_tokens set used=true where token=st.token;
  else
    insert into public.profiles(id,email,role) values(new.id,new.email,'user') on conflict(id) do nothing;
  end if;
  return new;
exception when others then
  insert into public.profiles(id,email,role) values(new.id,new.email,'user') on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.registration_codes(code,max_uses) values('FERIDEVADM',1) on conflict(code) do nothing;
insert into public.registration_codes(code,max_uses) values('FERI-REF',0) on conflict(code) do nothing;

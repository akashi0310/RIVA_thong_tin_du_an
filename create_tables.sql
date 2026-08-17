-- Chạy script này trong Supabase SQL Editor để tạo 3 bảng cho module Khối lượng Công việc

-- ─── TẠO BẢNG ────────────────────────────────────────────────────────────────

create table if not exists kl_cong_viec (
  id uuid primary key default gen_random_uuid(),
  stt integer,
  danh_muc text,
  ten_cong_viec text not null,
  dieu_hanh text,
  dieu_phoi text,
  thuc_hien text,
  san_pham text,
  deadline date,
  trang_thai text default '□',
  ghi_chu text,
  created_at timestamptz default now()
);

create table if not exists kl_kpi (
  id uuid primary key default gen_random_uuid(),
  ten_kpi text not null,
  don_vi text,
  muc_tieu numeric,
  thuc_te numeric default 0,
  ghi_chu text,
  created_at timestamptz default now()
);

create table if not exists kl_marketing (
  id uuid primary key default gen_random_uuid(),
  stt integer,
  nhom_san_pham text,
  doi_tuong text,
  dau_ra text,
  don_vi_kpi text,
  kpi_san_luong text,
  kpi_chat_luong text,
  nguoi_phu_trach text,
  nguoi_phoi_hop text,
  trang_thai text default '□',
  ghi_chu text,
  created_at timestamptz default now()
);

-- ─── RLS + POLICY (xóa cũ nếu có, tạo lại) ──────────────────────────────────

alter table kl_cong_viec enable row level security;
alter table kl_kpi enable row level security;
alter table kl_marketing enable row level security;

drop policy if exists "kl_cv_read" on kl_cong_viec;
drop policy if exists "kl_cv_all" on kl_cong_viec;
drop policy if exists "kl_kpi_read" on kl_kpi;
drop policy if exists "kl_kpi_all" on kl_kpi;
drop policy if exists "kl_mk_read" on kl_marketing;
drop policy if exists "kl_mk_all" on kl_marketing;

create policy "kl_cv_read" on kl_cong_viec for select using (true);
create policy "kl_cv_all"  on kl_cong_viec for all using (auth.uid() is not null);

create policy "kl_kpi_read" on kl_kpi for select using (true);
create policy "kl_kpi_all"  on kl_kpi for all using (auth.uid() is not null);

create policy "kl_mk_read" on kl_marketing for select using (true);
create policy "kl_mk_all"  on kl_marketing for all using (auth.uid() is not null);

-- ─── REALTIME (chỉ thêm nếu chưa có) ────────────────────────────────────────

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'kl_cong_viec'
  ) then
    alter publication supabase_realtime add table kl_cong_viec;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'kl_kpi'
  ) then
    alter publication supabase_realtime add table kl_kpi;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'kl_marketing'
  ) then
    alter publication supabase_realtime add table kl_marketing;
  end if;
end $$;

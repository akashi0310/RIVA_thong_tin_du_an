-- Run this in your Supabase SQL Editor to create all tables

-- INCIDENTS (ASMO)
CREATE TABLE incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ngay date,
  gio text,
  ma_su_co text,
  kenh_phat_sinh text,
  nguoi_bao_cao text,
  doi_tuong_lien_quan text,
  truong_don_vi text,
  sdt text,
  noi_dung text,
  nhom_su_co text,
  muc_do text,
  nguoi_tiep_nhan text,
  nguoi_phu_trach_xu_ly text,
  nguoi_phoi_hop text,
  thoi_diem_tiep_nhan timestamptz,
  deadline_phanhoi timestamptz,
  deadline_xu_ly timestamptz,
  trang_thai text DEFAULT 'Tiếp nhận',
  phuong_an_xu_ly text,
  ket_qua_xu_ly text,
  thoi_diem_hoan_thanh timestamptz,
  nguoi_xac_nhan text,
  nguyen_nhan text,
  hanh_dong_phong_ngua text,
  ghi_chu text,
  created_at timestamptz DEFAULT now()
);

-- TASKS (ASMO)
CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stt integer,
  nhom text,
  ten_cong_viec text,
  mo_ta text,
  nguoi_phu_trach text,
  nguoi_phoi_hop text[],
  trang_thai text DEFAULT 'Chưa bắt đầu',
  priority text DEFAULT 'P3',
  deadline date,
  ti_le_hoan_thanh integer DEFAULT 0,
  ghi_chu text,
  created_at timestamptz DEFAULT now()
);

-- NCKH PROJECTS
CREATE TABLE nckh_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  loai text,  -- IENA | IPITEX | SVIFF
  ten_de_tai text,
  nhom_nghien_cuu text,
  trang_thai text DEFAULT 'Đang nghiên cứu',
  ngay_bat_dau date,
  deadline date,
  mo_ta text,
  ket_qua text,
  ghi_chu text,
  created_at timestamptz DEFAULT now()
);

-- DU HOC STUDENTS
CREATE TABLE duhoc_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_hoc_sinh text,
  quoc_gia text,
  chuong_trinh text,
  truong_muc_tieu text,
  trang_thai text DEFAULT 'Tư vấn',
  nguoi_phu_trach text,
  ngay_nop_ho_so date,
  ngay_co_ket_qua date,
  hoc_bong boolean DEFAULT false,
  ghi_chu text,
  created_at timestamptz DEFAULT now()
);

-- ON LUYEN STUDENTS
CREATE TABLE onluyen_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_hoc_sinh text,
  ky_thi text,
  mon_hoc text,
  lop_hoc text,
  nguoi_phu_trach text,
  trang_thai text DEFAULT 'Đăng ký',
  ngay_bat_dau date,
  ngay_ket_thuc date,
  ket_qua text,
  ghi_chu text,
  created_at timestamptz DEFAULT now()
);

-- ROW LEVEL SECURITY
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nckh_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE duhoc_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE onluyen_students ENABLE ROW LEVEL SECURITY;

-- Public can READ all tables
CREATE POLICY "public read incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "public read nckh" ON nckh_projects FOR SELECT USING (true);
CREATE POLICY "public read duhoc" ON duhoc_students FOR SELECT USING (true);
CREATE POLICY "public read onluyen" ON onluyen_students FOR SELECT USING (true);

-- Authenticated (managers) can do everything
CREATE POLICY "manager all incidents" ON incidents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "manager all tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "manager all nckh" ON nckh_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "manager all duhoc" ON duhoc_students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "manager all onluyen" ON onluyen_students FOR ALL USING (auth.role() = 'authenticated');

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

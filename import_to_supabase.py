"""
Script nhập dữ liệu từ Excel vào Supabase
Chạy: python import_to_supabase.py

Yêu cầu:
  pip install pandas openpyxl supabase python-dotenv
"""

import sys
import os
import pandas as pd
from supabase import create_client
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

FILENAME = 'He_thong_quan_ly_khoi_luong_cong_viec_KPI_CHI_TIET.xlsx'
_script_dir = os.path.dirname(os.path.abspath(__file__))
CANDIDATES = [
    os.path.join(_script_dir, FILENAME),
    os.path.join(_script_dir, '..', FILENAME),
]
EXCEL_PATH = next((p for p in CANDIDATES if os.path.exists(p)), None)
if not EXCEL_PATH:
    print(f"❌ Không tìm thấy file Excel. Đặt file vào cùng thư mục với script.")
    sys.exit(1)

print(f"📂 Đọc file: {EXCEL_PATH}")

# ─── 1. DANH MỤC CÔNG VIỆC ───────────────────────────────────────────────────
# Cấu trúc Excel (hàng 0 là header):
# A=STT | B=Nhóm cấp 1 | C=Dự án | D=Nhóm cấp 2 | E=Đầu việc | F=Output | G=Đơn vị | H=Người thực hiện | I=KPI

def parse_cong_viec(excel_path):
    df = pd.read_excel(excel_path, sheet_name=0, header=0)
    tasks = []

    for _, row in df.iterrows():
        def val(col):
            v = row.iloc[col]
            return str(v).strip() if pd.notna(v) and str(v).strip() != 'nan' else ''

        stt_raw = val(0)
        nhom_cap_1 = val(1)
        du_an = val(2)
        nhom_cap_2 = val(3)
        ten_cong_viec = val(4)

        # Bỏ qua hàng trống hoặc không có đầu việc
        if not ten_cong_viec:
            continue

        try:
            stt_val = int(float(stt_raw)) if stt_raw else len(tasks) + 1
        except ValueError:
            stt_val = len(tasks) + 1

        tasks.append({
            'stt': stt_val,
            'nhom_cap_1': nhom_cap_1,
            'du_an': du_an,
            'nhom_cap_2': nhom_cap_2,
            'ten_cong_viec': ten_cong_viec,
            'san_pham': val(5),
            'don_vi': val(6),
            'thuc_hien': val(7),
            'kpi_theo_doi': val(8),
            'trang_thai': '□',
            'ghi_chu': '',
        })

    return tasks

# ─── 2. KPI MẪU ──────────────────────────────────────────────────────────────

def parse_kpi(excel_path):
    df = pd.read_excel(excel_path, sheet_name='KPI mẫu', header=None)
    kpi_list = []

    for _, row in df.iterrows():
        v = [str(c).strip() if pd.notna(c) else '' for c in row]
        if v[0] in ('STT', '') or v[1] in ('Tên KPI', 'Chỉ số', ''):
            continue
        if not v[1]:
            continue

        def to_num(s):
            try:
                return float(s.replace(',', '.')) if s else None
            except ValueError:
                return None

        kpi_list.append({
            'ten_kpi': v[1],
            'don_vi': v[2],
            'muc_tieu': to_num(v[3]),
            'thuc_te': to_num(v[4]) or 0,
            'ghi_chu': v[5] if len(v) > 5 else '',
        })

    return kpi_list

# ─── 3. MARKETING OUTPUT MATRIX ──────────────────────────────────────────────
# Cột Excel: Nhóm sản phẩm | Đối tượng | Đầu ra bắt buộc | Đơn vị KPI |
#            KPI sản lượng tháng | KPI chất lượng/chuyển đổi | Người phụ trách chính | Người phối hợp

def parse_marketing(excel_path):
    df = pd.read_excel(excel_path, sheet_name='Marketing Output Matrix', header=0)
    items = []

    for i, (_, row) in enumerate(df.iterrows()):
        v = [str(c).strip() if pd.notna(c) and str(c).strip() != 'nan' else '' for c in row]

        # Bỏ qua hàng trống (không có nhóm sản phẩm lẫn đầu ra)
        nhom = v[0] if len(v) > 0 else ''
        dau_ra = v[2] if len(v) > 2 else ''
        if not nhom and not dau_ra:
            continue

        items.append({
            'stt': i + 1,
            'nhom_san_pham': nhom,
            'doi_tuong': v[1] if len(v) > 1 else '',
            'dau_ra': dau_ra,
            'don_vi_kpi': v[3] if len(v) > 3 else '',
            'kpi_san_luong': v[4] if len(v) > 4 else '',
            'kpi_chat_luong': v[5] if len(v) > 5 else '',
            'nguoi_phu_trach': v[6] if len(v) > 6 else '',
            'nguoi_phoi_hop': v[7] if len(v) > 7 else '',
            'trang_thai': '□',
            'ghi_chu': '',
        })

    return items

# ─── NHẬP VÀO SUPABASE ───────────────────────────────────────────────────────

def upsert_batch(table, records, chunk_size=50):
    if not records:
        print(f"  ⚠️  Không có dữ liệu để nhập vào {table}")
        return
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        res = supabase.table(table).insert(chunk).execute()
        if hasattr(res, 'error') and res.error:
            print(f"  ❌ Lỗi khi nhập vào {table}: {res.error}")
            return
    print(f"  ✅ Đã nhập {len(records)} bản ghi vào {table}")

def clear_table(table):
    supabase.table(table).delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

print("\n=== BẮT ĐẦU NHẬP DỮ LIỆU ===\n")

try:
    print("1️⃣  Danh mục công việc...")
    tasks = parse_cong_viec(EXCEL_PATH)
    print(f"   Tìm thấy {len(tasks)} công việc")
    clear_table('kl_cong_viec')
    upsert_batch('kl_cong_viec', tasks)
except Exception as e:
    print(f"  ❌ Lỗi sheet Danh mục công việc: {e}")

try:
    print("\n2️⃣  KPI mẫu...")
    kpi = parse_kpi(EXCEL_PATH)
    print(f"   Tìm thấy {len(kpi)} chỉ số KPI")
    clear_table('kl_kpi')
    upsert_batch('kl_kpi', kpi)
except Exception as e:
    print(f"  ❌ Lỗi sheet KPI mẫu: {e}")

try:
    print("\n3️⃣  Marketing Output Matrix...")
    marketing = parse_marketing(EXCEL_PATH)
    print(f"   Tìm thấy {len(marketing)} ấn phẩm")
    clear_table('kl_marketing')
    upsert_batch('kl_marketing', marketing)
except Exception as e:
    print(f"  ❌ Lỗi sheet Marketing Output Matrix: {e}")

print("\n=== HOÀN TẤT ===")
print("Vào app RIVA → Khối lượng để kiểm tra dữ liệu.")

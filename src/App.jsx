import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppShell from './components/layout/AppShell'

// Pages
import Home from './pages/Home'
import ASMOLayout from './pages/asmo/ASMOLayout'
import ASMODashboard from './pages/asmo/ASMODashboard'
import IncidentList from './pages/asmo/IncidentList'
import IncidentForm from './pages/asmo/IncidentForm'
import IncidentDetail from './pages/asmo/IncidentDetail'
import TaskBoard from './pages/asmo/TaskBoard'
import TeamView from './pages/asmo/TeamView'
import DailyKPIReport from './pages/asmo/DailyKPIReport'

import NCKHLayout from './pages/nckh/NCKHLayout'
import NCKHDashboard from './pages/nckh/NCKHDashboard'
import SubProjectView from './pages/nckh/SubProjectView'

import DuHocLayout from './pages/duhoc/DuHocLayout'
import DuHocDashboard from './pages/duhoc/DuHocDashboard'

import OnLuyenLayout from './pages/onluyen/OnLuyenLayout'
import OnLuyenDashboard from './pages/onluyen/OnLuyenDashboard'

import CSKHLayout from './pages/cskh/CSKHLayout'
import CSKHDashboard from './pages/cskh/CSKHDashboard'
import MessageInbox from './pages/cskh/MessageInbox'
import FAQManager from './pages/cskh/FAQManager'
import WebFormPage from './pages/cskh/WebFormPage'

import KhoiLuongLayout from './pages/khoiluong/KhoiLuongLayout'
import KhoiLuongDashboard from './pages/khoiluong/KhoiLuongDashboard'
import DanhMucCongViec from './pages/khoiluong/DanhMucCongViec'
import KPINhanVien from './pages/khoiluong/KPINhanVien'
import MatranAnPham from './pages/khoiluong/MatranAnPham'
import NhanVienView from './pages/khoiluong/NhanVienView'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />

          <Route path="asmo" element={<ASMOLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ASMODashboard />} />
            <Route path="incidents" element={<IncidentList />} />
            <Route path="incidents/new" element={<IncidentForm />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="incidents/:id/edit" element={<IncidentForm />} />
            <Route path="tasks" element={<TaskBoard />} />
            <Route path="team" element={<TeamView />} />
            <Route path="report" element={<DailyKPIReport />} />
          </Route>

          <Route path="nckh" element={<NCKHLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<NCKHDashboard />} />
            <Route path="iena" element={<SubProjectView type="IENA" />} />
            <Route path="ipitex" element={<SubProjectView type="IPITEX" />} />
            <Route path="sviff" element={<SubProjectView type="SVIFF" />} />
          </Route>

          <Route path="du-hoc" element={<DuHocLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DuHocDashboard />} />
          </Route>

          <Route path="on-luyen" element={<OnLuyenLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OnLuyenDashboard />} />
          </Route>

          <Route path="cskh" element={<CSKHLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CSKHDashboard />} />
            <Route path="inbox" element={<MessageInbox />} />
            <Route path="faq" element={<FAQManager />} />
            <Route path="web-form" element={<WebFormPage />} />
          </Route>

          <Route path="khoi-luong" element={<KhoiLuongLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<KhoiLuongDashboard />} />
            <Route path="cong-viec" element={<DanhMucCongViec />} />
            <Route path="kpi" element={<KPINhanVien />} />
            <Route path="an-pham" element={<MatranAnPham />} />
            <Route path="nhan-vien" element={<NhanVienView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

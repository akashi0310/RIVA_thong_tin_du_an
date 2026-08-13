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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./auth/AuthPage";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        {/* All protected routes share sidebar + auth */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

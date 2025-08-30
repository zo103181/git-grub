import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './auth/AuthPage'
import ShellLayout from './layouts/ShellLayout'
import RequireAuth from './auth/RequireAuth'

import SettingsPage from './pages/SettingsPage'
import ExplorePage from './pages/ExplorePage'
import RecipeDetail from './pages/RecipeDetailPage'
import ProfilePage from './pages/ProfilePage'
import NewRecipe from './pages/NewRecipePage'
import EditRecipePage from './pages/EditRecipePage'
import ForkRecipePage from './pages/ForkRecipePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth entry */}
        <Route path="/" element={<AuthPage />} />

        {/* Shared layout for BOTH public and authed visitors */}
        <Route element={<ShellLayout />}>
          {/* Public-browse routes */}
          <Route path="recipes">
            <Route index element={<ExplorePage />} />
          </Route>
          <Route path="r/:id" element={<RecipeDetail />} />
          <Route path="u/:id" element={<ProfilePage />} />

          {/* Protected routes (writes / account) */}
          <Route
            path="recipes/new"
            element={
              <RequireAuth>
                <NewRecipe />
              </RequireAuth>
            }
          />
          <Route
            path="r/:id/edit"
            element={
              <RequireAuth>
                <EditRecipePage />
              </RequireAuth>
            }
          />
          <Route
            path="r/:id/fork"
            element={
              <RequireAuth>
                <ForkRecipePage />
              </RequireAuth>
            }
          />
          <Route
            path="settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/recipes" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationProvider } from './context/NotificationContext.tsx'
import NotificationRenderer from './components/overlays/NotificationRenderer.tsx'
import { UserProvider } from './context/UserContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <UserProvider>
        <App />
      </UserProvider>
      <NotificationRenderer />
    </NotificationProvider>
  </StrictMode>,
)

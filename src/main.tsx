import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationProvider } from './context/NotificationContext.tsx'
import NotificationRenderer from './components/overlays/NotificationRenderer.tsx'
import { UserProvider } from './context/UserContext.tsx'
import { ModalProvider } from './context/ModalDialogAlertContext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes "fresh"
      gcTime: 1000 * 60 * 30,       // cache for 30 minutes
      refetchOnWindowFocus: false,  // prevent surprise refetch
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <ModalProvider>
          <UserProvider>
            <App />
          </UserProvider>
          <NotificationRenderer />
        </ModalProvider>
      </NotificationProvider>
    </QueryClientProvider>
  </StrictMode>,
)

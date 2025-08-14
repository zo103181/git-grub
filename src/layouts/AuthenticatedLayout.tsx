import { Outlet } from 'react-router-dom'
import { SideNavigationLayout } from './SideNavigationLayout'
import RequireAuth from '../auth/RequireAuth'

export default function AuthenticatedLayout() {
    return (
        <RequireAuth>
            <SideNavigationLayout>
                <Outlet />
            </SideNavigationLayout>
        </RequireAuth>
    )
}
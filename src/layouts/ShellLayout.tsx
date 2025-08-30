import { Outlet, Link } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { SideNavigationLayout } from '@/layouts/SideNavigationLayout'

export default function ShellLayout() {
    const { authUser } = useUser()

    if (authUser) {
        return (
            <SideNavigationLayout>
                <Outlet />
            </SideNavigationLayout>
        )
    }

    // Public: slim top bar + content
    return (
        <div className="min-h-screen bg-white">
            <header className="border-b">
                <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
                    <div className="flex h-16 items-center">
                        <img
                            src="/icon-512-octo.png"
                            alt="GitGrub Logo"
                            className="h-12 w-auto"
                        /><Link to="/recipes" className="text-gray-600 font-semibold text-3xl ml-2">GitGrub</Link>
                    </div>

                    <Link
                        to="/"
                        className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-800"
                    >
                        Sign In
                    </Link>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-4">
                <Outlet />
            </main>
        </div>
    )
}
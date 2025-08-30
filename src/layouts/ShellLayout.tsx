import { Outlet, Link } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import SideNav from '@/components/SideNav'

export default function ShellLayout() {
    const { authUser } = useUser()

    if (authUser) {
        return (
            <div className="h-screen w-screen flex">
                <aside className="w-64 shrink-0 bg-gray-900 text-white">
                    <SideNav />
                </aside>
                <main className="flex-1 overflow-y-auto bg-white">
                    <Outlet />
                </main>
            </div>
        )
    }

    // Public: slim top bar + content
    return (
        <div className="min-h-screen bg-white">
            <header className="border-b">
                <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
                    <Link to="/recipes" className="font-semibold">GitGrub</Link>
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

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import supabase from '@/lib/supabase'
import RecipeCard, { RecipeCardData } from '@/components/RecipeCard'
import NotFound from '@/components/NotFound'

type UserRow = {
    id: string
    display_name: string | null
    avatar_photo: string | null
    cover_photo?: string | null
}

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>()
    const [user, setUser] = useState<UserRow | null>(null)
    const [recipes, setRecipes] = useState<RecipeCardData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        if (!id) return
            ; (async () => {
                try {
                    setLoading(true); setError(null)

                    // Fetch user and their recipes in parallel
                    const [uRes, rRes] = await Promise.all([
                        supabase
                            .from('users')
                            .select('id,display_name,avatar_photo,cover_photo')
                            .eq('id', id)
                            .single<UserRow>(),
                        supabase
                            .from('recipes')
                            .select(`
              id, title, tags, created_at,
              like_count, fork_count, version_count
            `)
                            .eq('user_id', id)
                            .order('created_at', { ascending: false })
                    ])

                    if (uRes.error || !uRes.data) throw uRes.error ?? new Error('User not found')
                    if (rRes.error) throw rRes.error

                    // Reuse the same author object for all cards (owner’s profile)
                    const authorForCards = {
                        id: uRes.data.id,
                        display_name: uRes.data.display_name ?? 'Unknown Chef',
                        avatar_photo: uRes.data.avatar_photo ?? null,
                    }

                    const rows = (rRes.data ?? []).map((rec: any) => ({
                        id: rec.id,
                        title: rec.title,
                        tags: rec.tags ?? [],
                        created_at: rec.created_at,
                        likeCount: rec.like_count ?? 0,      // ✅ denormalized
                        // (optional) forkCount: rec.fork_count ?? 0,
                        // (optional) versionCount: rec.version_count ?? 0,
                        author: authorForCards,
                    })) as RecipeCardData[]

                    if (!mounted) return
                    setUser(uRes.data)
                    setRecipes(rows)
                } catch (e: any) {
                    if (mounted) setError(e?.message ?? 'Failed to load profile')
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => { mounted = false }
    }, [id])

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl p-4">
                <div className="h-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-40 mt-3 bg-gray-100 rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded animate-pulse" />)}
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <NotFound
                title="User not found"
                description="We couldn’t find that chef’s profile."
                ctaHref="/recipes"
                ctaLabel="Explore Recipes"
            />
        )
    }

    return (
        <div className="mx-auto max-w-5xl p-4">
            {/* Header */}
            <div className="rounded-xl overflow-hidden border">
                {user.cover_photo ? (
                    <img src={user.cover_photo} alt="" className="h-40 w-full object-cover" />
                ) : (
                    <div className="h-40 w-full bg-gray-100" />
                )}
                <div className="p-4 flex items-center gap-3">
                    {user.avatar_photo ? (
                        <img
                            src={user.avatar_photo}
                            alt={user.display_name ?? 'User'}
                            className="h-14 w-14 rounded-full object-cover -mt-10 border-2 border-white"
                        />
                    ) : (
                        <div className="h-14 w-14 rounded-full bg-gray-200 -mt-10 border-2 border-white flex items-center justify-center">
                            {(user.display_name ?? 'U').slice(0, 1)}
                        </div>
                    )}
                    <div>
                        <div className="text-lg font-semibold">{user.display_name ?? 'Chef'}</div>
                        <div className="text-sm text-gray-500">Recipes • {recipes.length}</div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {recipes.length === 0 ? (
                <div className="mt-6 text-gray-700">No recipes yet.</div>
            ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recipes.map(r => <RecipeCard key={r.id} data={r} />)}
                </div>
            )}
        </div>
    )
}

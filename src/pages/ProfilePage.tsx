import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import supabase from '@/lib/supabase'
import RecipeCard, { RecipeCardData } from '@/components/RecipeCard'
import NotFound from '@/components/NotFound'
import FollowButton from '@/components/FollowButton'
import { useUser } from '@/context/UserContext'

type UserRow = {
    id: string
    display_name: string | null
    avatar_photo: string | null
    cover_photo?: string | null
    follower_count: number
    following_count: number
    followed_by_me: boolean
}

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>()
    const { profile } = useUser() // viewer (if signed-in)
    const [user, setUser] = useState<UserRow | null>(null)
    const [recipes, setRecipes] = useState<RecipeCardData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isMe = !!profile?.id && !!user?.id && profile.id === user.id

    useEffect(() => {
        let mounted = true
        if (!id) return

            ; (async () => {
                try {
                    setLoading(true); setError(null)

                    // Single RPC for profile (includes follower_count, following_count, followed_by_me)
                    const [{ data: profileRows, error: pErr }, { data: recRows, error: rErr }] = await Promise.all([
                        supabase.rpc('rpc_profile_view', { p_user_id: id }),
                        supabase
                            .from('recipes')
                            .select('id, title, tags, created_at, like_count, fork_count, version_count')
                            .eq('user_id', id)
                            .order('created_at', { ascending: false }),
                    ])

                    if (pErr || !profileRows?.[0]) throw pErr ?? new Error('User not found')
                    if (rErr) throw rErr

                    const u = profileRows[0] as UserRow
                    const authorForCards = {
                        id: u.id,
                        display_name: u.display_name ?? 'Unknown Chef',
                        avatar_photo: u.avatar_photo ?? null,
                    }

                    const rows = (recRows ?? []).map((rec: any) => ({
                        id: rec.id,
                        title: rec.title,
                        tags: rec.tags ?? [],
                        created_at: rec.created_at,
                        likeCount: rec.like_count ?? 0,
                        author: authorForCards,
                    })) as RecipeCardData[]

                    if (!mounted) return
                    setUser(u)
                    setRecipes(rows)
                } catch (e: any) {
                    if (mounted) setError(e?.message ?? 'Failed to load profile')
                } finally {
                    if (mounted) setLoading(false)
                }
            })()

        return () => { mounted = false }
    }, [id])

    const handleFollowToggle = (nextFollowing: boolean) => {
        setUser((u) => {
            if (!u) return u
            const delta = nextFollowing ? 1 : -1
            return {
                ...u,
                followed_by_me: nextFollowing,
                follower_count: Math.max(0, (u.follower_count ?? 0) + delta),
            }
        })
    }

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
            <section className="rounded-2xl overflow-hidden border bg-white">
                {/* Cover */}
                <div className="relative h-44 sm:h-56 lg:h-64 bg-gray-100">
                    {user.cover_photo ? (
                        <img
                            src={user.cover_photo}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : null}

                    {/* Primary action on cover (right) */}
                    {!isMe && (
                        <div className="absolute right-3 bottom-3 hidden sm:block">
                            <FollowButton
                                userId={user.id}
                                initialFollowing={user.followed_by_me}
                                onToggle={handleFollowToggle}
                                className="shadow-lg"
                            />
                        </div>
                    )}
                </div>

                {/* Bottom card with avatar overlapping */}
                <div className="relative px-4 sm:px-6 pb-5">
                    {/* Avatar (centered) */}
                    <div className="absolute left-1/2 -top-10 -translate-x-1/2">
                        {user.avatar_photo ? (
                            <img
                                src={user.avatar_photo}
                                alt={user.display_name ?? 'User'}
                                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                            />
                        ) : (
                            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 ring-4 ring-white shadow-md grid place-items-center text-2xl">
                                {(user.display_name ?? 'U').slice(0, 1)}
                            </div>
                        )}
                    </div>

                    {/* Name + meta */}
                    <div className="pt-14 sm:pt-16 text-center">
                        <h1 className="text-xl sm:text-2xl font-semibold truncate">
                            {user.display_name ?? 'Chef'}
                        </h1>

                        <p className="mt-1 text-sm text-gray-500 truncate">Slogan Here</p>
                    </div>

                    {/* Stats row */}
                    <div className="mt-4 flex items-center justify-center gap-6 sm:gap-10 text-sm">
                        <div className="text-center">
                            <div className="font-semibold">{recipes.length}</div>
                            <div className="uppercase tracking-wide text-gray-500 text-[11px]">Posts</div>
                        </div>
                        <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                        <div className="text-center">
                            <div className="font-semibold">{user.follower_count}</div>
                            <div className="uppercase tracking-wide text-gray-500 text-[11px]">Followers</div>
                        </div>
                        <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                        <div className="text-center">
                            <div className="font-semibold">{user.following_count}</div>
                            <div className="uppercase tracking-wide text-gray-500 text-[11px]">Following</div>
                        </div>
                    </div>

                    {/* Mobile action (stacked under stats) */}
                    {!isMe && (
                        <div className="mt-4 sm:hidden flex justify-center">
                            <FollowButton
                                userId={user.id}
                                initialFollowing={user.followed_by_me}
                                onToggle={handleFollowToggle}
                                className="w-full max-w-xs"
                            />
                        </div>
                    )}

                    {/* Optional social icons row (placeholders) */}
                    {/* <div className="mt-4 flex justify-center gap-3 text-gray-500">
      <button className="p-2 rounded-full hover:bg-gray-100"><IconFb /></button>
      <button className="p-2 rounded-full hover:bg-gray-100"><IconX /></button>
      <button className="p-2 rounded-full hover:bg-gray-100"><IconIg /></button>
    </div> */}
                </div>
            </section>

            {/* Profile header (Instagram-style) */}
            <div className="rounded-xl overflow-hidden border bg-white">
                {/* Banner */}
                {user.cover_photo ? (
                    <img src={user.cover_photo} alt="" className="h-40 w-full object-cover" />
                ) : (
                    <div className="h-40 w-full bg-gray-100" />
                )}

                {/* Avatar + name + follow + counts */}
                <div className="px-4 pb-4">
                    <div className="-mt-10 flex items-center gap-4">
                        {user.avatar_photo ? (
                            <img
                                src={user.avatar_photo}
                                alt={user.display_name ?? 'User'}
                                className="h-20 w-20 rounded-full object-cover ring-2 ring-white"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xl">
                                {(user.display_name ?? 'U').slice(0, 1)}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="text-xl font-semibold truncate">
                                    {user.display_name ?? 'Chef'}
                                </div>
                                {!isMe && (
                                    <FollowButton
                                        userId={user.id}
                                        initialFollowing={user.followed_by_me}
                                        className="sm:ml-3"
                                        onToggle={handleFollowToggle}
                                    />
                                )}
                            </div>

                            {/* Counts row */}
                            <div className="mt-4 flex items-center gap-6 text-sm text-gray-700">
                                <div className="text-center">
                                    <div className="font-semibold">{recipes.length}</div>
                                    <div className="uppercase tracking-wide text-gray-500 text-[11px]">Posts</div>
                                </div>
                                <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                                <div className="text-center">
                                    <div className="font-semibold">{user.follower_count}</div>
                                    <div className="uppercase tracking-wide text-gray-500 text-[11px]">Followers</div>
                                </div>
                                <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                                <div className="text-center">
                                    <div className="font-semibold">{user.following_count}</div>
                                    <div className="uppercase tracking-wide text-gray-500 text-[11px]">Following</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of recipes */}
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

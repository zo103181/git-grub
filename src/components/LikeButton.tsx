import supabase from '@/lib/supabase'
import { useRef, useState } from 'react'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

function formatCount(n: number) {
    if (n < 1000) return String(n)
    if (n < 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    if (n < 1_000_000) return Math.round(n / 1000) + 'k'
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm'
}

export default function LikeButton({
    recipeId,
    initialLiked = false,
    initialCount = 0,
}: {
    recipeId: string
    initialLiked?: boolean
    initialCount?: number
}) {
    const [liked, setLiked] = useState(initialLiked)
    const [count, setCount] = useState(initialCount)
    const [busy, setBusy] = useState(false)
    const liveRef = useRef<HTMLSpanElement>(null)

    const toggle = async () => {
        if (busy) return
        setBusy(true)

        // snapshot for rollback
        const prevLiked = liked
        const prevCount = count

        // optimistic flip
        const nextLiked = !prevLiked
        setLiked(nextLiked)
        setCount(c => Math.max(0, c + (nextLiked ? 1 : -1)))

        try {
            const { data: session } = await supabase.auth.getSession()
            const uid = session?.session?.user?.id
            if (!uid) throw new Error('Sign in required')

            if (nextLiked) {
                const { error } = await supabase
                    .from('recipe_likes')
                    .insert({ user_id: uid, recipe_id: recipeId })
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('recipe_likes')
                    .delete()
                    .eq('user_id', uid)
                    .eq('recipe_id', recipeId)
                if (error) throw error
            }
            // like_count is maintained by DB triggers; no refetch needed
        } catch (e: any) {
            // rollback exactly to previous state
            setLiked(prevLiked)
            setCount(prevCount)
            alert(e?.message ?? 'Failed to update like')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="inline-flex items-center">
            <button
                onClick={toggle}
                disabled={busy}
                aria-pressed={liked}
                aria-label={liked ? 'Unlike this recipe' : 'Like this recipe'}
                title={liked ? 'Unlike' : 'Like'}
                className="flex items-center gap-1 text-sm px-3 py-2 rounded border transition
                   hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 cursor-pointer"
            >
                <span className={`grid place-items-center ${liked ? 'motion-safe:animate-[pop_140ms_ease-out]' : ''}`}>
                    {liked ? (
                        <HeartSolid className="h-5 w-5 text-rose-600" />
                    ) : (
                        <HeartOutline className="h-5 w-5 text-gray-600" />
                    )}
                </span>
                {/* keep width stable; use tabular numerals for less jitter */}
                <span className="tabular-nums ml-0.5 inline-block min-w-[1.6ch] text-gray-800">
                    {formatCount(count)}
                </span>
            </button>

            {/* announce changes for screen readers */}
            <span ref={liveRef} aria-live="polite" className="sr-only">
                {liked ? 'Liked. ' : 'Unliked. '} Total likes {count}.
            </span>
        </div>
    )
}

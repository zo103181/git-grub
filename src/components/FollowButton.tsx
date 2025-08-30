import { useState } from 'react'
import supabase from '@/lib/supabase'

export default function FollowButton({
    userId,
    initialFollowing,
    initialFollowerCount,
    className = '',
    compact = false,
    disabledReason,
}: {
    userId: string
    initialFollowing: boolean
    initialFollowerCount: number
    className?: string
    compact?: boolean
    disabledReason?: string
}) {
    const [following, setFollowing] = useState(initialFollowing)
    const [count, setCount] = useState(initialFollowerCount)
    const [busy, setBusy] = useState(false)

    const toggle = async () => {
        if (busy) return
        setBusy(true)

        // optimistic
        const next = !following
        setFollowing(next)
        setCount(c => c + (next ? 1 : -1))

        try {
            const { data } = await supabase.auth.getSession()
            if (!data.session) throw new Error('Sign in required')

            const { data: res, error } = await supabase.rpc('rpc_follow_toggle', {
                p_followee: userId,
            })
            if (error) throw error

            // trust server truth (handles race conditions)
            if (Array.isArray(res) && res[0]) {
                setFollowing(res[0].following)
                setCount(res[0].follower_count ?? 0)
            }
        } catch (e: any) {
            // rollback on failure
            setFollowing(following)
            setCount(c => c + (following ? 0 : 0))
            alert(e.message ?? 'Failed to update follow')
        } finally {
            setBusy(false)
        }
    }

    const label = following ? 'Following' : 'Follow'

    return (
        <button
            onClick={toggle}
            disabled={busy || !!disabledReason}
            title={disabledReason}
            className={[
                'flex items-center gap-2 text-sm px-3 py-2 rounded border transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60',
                compact ? 'text-xs px-2 py-1' : '',
                className,
            ].join(' ')}
            aria-pressed={following}
            aria-label={label}
        >
            <span>{label}</span>
            <span className="text-gray-500">•</span>
            <span className="tabular-nums">{count}</span>
        </button>
    )
}

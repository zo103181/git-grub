import { useState } from 'react'
import supabase from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

export default function FollowButton({
    userId,
    initialFollowing,
    className = '',
    disabledReason,
    onToggle
}: {
    userId: string
    initialFollowing: boolean
    className?: string
    disabledReason?: string
    onToggle?: (nextFollowing: boolean) => void
}) {
    const { profile } = useUser()
    const viewerId = profile?.id
    const [following, setFollowing] = useState(initialFollowing)
    const [busy, setBusy] = useState(false)

    const toggle = async () => {
        const next = !following
        setFollowing(next)

        try {
            if (next) {
                const { error } = await supabase.from('follows').insert({ follower_id: viewerId, followee_id: userId })
                if (error) throw error
            } else {
                const { error } = await supabase.from('follows')
                    .delete()
                    .eq('follower_id', viewerId)
                    .eq('followee_id', userId)
                if (error) throw error
            }
            onToggle?.(next)
        } catch (e) {
            setFollowing(!next)
        }
    }

    return (
        <button
            onClick={toggle}
            disabled={busy || !!disabledReason}
            title={disabledReason}
            className={[
                'cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition',
                following
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' // Unfollow = neutral
                    : 'bg-blue-600 text-white hover:bg-blue-700',   // Follow = primary
                busy || disabledReason ? 'opacity-60 cursor-not-allowed' : '',
                className,
            ].join(' ')}
            aria-pressed={following}
        >
            {following ? 'Unfollow' : 'Follow'}
        </button>
    )
}

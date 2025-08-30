import { useState } from 'react'
import { ShareIcon } from '@heroicons/react/24/outline'
import { useNotification } from '@/hooks/useNotification'

export default function ShareButton({
    url,
    title,
    text,
    className = ''
}: {
    url: string
    title: string
    text?: string
    className?: string
    useToast?: boolean
}) {
    const [busy, setBusy] = useState(false)
    const { showNotification } = useNotification()

    const onShare = async () => {
        if (busy) return
        setBusy(true)
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url })
            } else {
                await navigator.clipboard.writeText(url)
                showNotification?.({
                    type: 'success',
                    message: 'Link copied',
                    description: 'URL has been copied to your clipboard.',
                })
            }
        } catch {
            // user cancelled or unsupported — ignore
        } finally {
            setBusy(false)
        }
    }

    return (
        <button
            onClick={onShare}
            disabled={busy}
            aria-label="Share this recipe"
            className={[
                'flex items-center gap-1 text-sm px-3 py-2 rounded border transition',
                'hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 cursor-pointer',
                className,
            ].join(' ')}
            title="Share"
        >
            <ShareIcon className="h-5 w-5 text-gray-600" />
            <span className='hidden sm:block'>Share</span>
        </button>
    )
}

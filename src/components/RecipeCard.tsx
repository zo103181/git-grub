import { Link } from 'react-router-dom'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

export type RecipeCardData = {
    id: string
    title: string
    tags: string[]
    created_at: string
    likeCount: number
    author: {
        id: string
        display_name: string
        avatar_photo: string | null
    } | null
}

export default function RecipeCard({
    data,
    onTagClick,
}: {
    data: RecipeCardData
    onTagClick?: (tag: string) => void
}) {
    const { id, title, tags, created_at, likeCount, author } = data
    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow transition">
            {/* Header row */}
            <div className="flex items-center gap-3">
                {author?.avatar_photo ? (
                    <img
                        src={author.avatar_photo}
                        alt={author.display_name}
                        className="h-8 w-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {(author?.display_name ?? 'U').slice(0, 1)}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{author?.display_name ?? 'Unknown Chef'}</div>
                    <div className="text-xs text-gray-500">Created {new Date(created_at).toLocaleDateString()}</div>
                </div>
                <div className="ml-auto inline-flex items-center gap-1.5 text-gray-600">
                    <HeartSolid className="h-5 w-5 text-rose-600" />
                    <span className="text-base font-semibold">{likeCount}</span>
                </div>
            </div>

            {/* Title */}
            <Link to={`/r/${id}`} className="mt-3 block">
                <h2 className="text-lg font-semibold line-clamp-2 hover:underline">{title}</h2>
            </Link>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {data.tags.map(t => (
                        <button
                            key={t}
                            onClick={(e) => { e.preventDefault(); onTagClick?.(t) }}
                            className="px-2 py-0.5 text-[11px] rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
                            title={`Filter by #${t}`}
                        >
                            #{t}
                        </button>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="mt-4">
                <Link
                    to={`/r/${id}`}
                    className="text-sm text-blue-600 hover:underline"
                >
                    View recipe →
                </Link>
            </div>
        </div>
    )
}

import { Link, useLocation } from 'react-router-dom'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useUser } from '@/context/UserContext'
import LikeButton from '@/components/LikeButton'
import ForkButton from '@/components/ForkButton'
import ShareButton from '@/components/ShareButton'
import DeleteRecipeButton from '@/components/DeleteRecipeButton'
import MobileActionsPortal from '@/components/MobileActionsPortal'

type BaseVersion = {
    ingredients: string[]
    steps: string[]
    notes: string | null
}

export default function RecipeActions({
    isOwner,
    recipeId,
    recipeTitle,
    tags,
    forkedFromId,
    likeCount,
    likedByMe,
    baseVersion,
    showNewRecipe = true,
}: {
    isOwner: boolean
    recipeId: string
    recipeTitle: string
    tags: string[] | null
    forkedFromId: string | null
    likeCount: number
    likedByMe: boolean
    baseVersion: BaseVersion
    showNewRecipe?: boolean
}) {
    // 🔒 top-level hooks only
    const location = useLocation()
    const { authUser } = useUser()
    const isAuthed = !!authUser

    const shareUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}${location.pathname}${location.search}`
            : location.pathname + location.search

    // Static like pill for anonymous users (no toggle)
    const StaticLike = ({ count }: { count: number }) => (
        <div
            className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded border
                 hover:bg-gray-50 cursor-default select-none"
            title="Sign in to like"
            aria-label={`Total likes ${count}`}
        >
            <HeartOutline className="h-5 w-5 text-gray-600" />
            <span className="tabular-nums ml-0.5 inline-block min-w-[1.6ch] text-gray-800">
                {count}
            </span>
        </div>
    )

    // Actions group (used by desktop + mobile)
    const Actions = ({ compact = false }: { compact?: boolean }) => {
        const gap = compact ? 'gap-2' : 'gap-3 sm:gap-4'
        const btnBase = `${compact ? 'text-sm' : 'text-sm'} px-3 py-2 rounded`

        return (
            <div className={`flex items-center ${gap}`}>
                {isAuthed ? (
                    isOwner ? (
                        <>
                            <Link
                                to={`/r/${recipeId}/edit`}
                                className={`${btnBase} border hover:bg-gray-100 cursor-pointer`}
                            >
                                Edit
                            </Link>
                            <DeleteRecipeButton
                                recipeId={recipeId}
                                recipeTitle={recipeTitle}
                                afterDeletePath="/recipes"
                                className=""
                            />
                        </>
                    ) : (
                        <LikeButton
                            recipeId={recipeId}
                            initialLiked={likedByMe}
                            initialCount={likeCount}
                        />
                    )
                ) : (
                    <StaticLike count={likeCount} />
                )}

                {/* Fork: only for authed users (owners and non-owners) */}
                {isAuthed && (
                    <ForkButton
                        recipeId={recipeId}
                        title={recipeTitle}
                        tags={tags ?? []}
                        baseVersion={baseVersion}
                        className={`${btnBase} bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition`}
                    />
                )}

                {/* Share: available to everyone */}
                <ShareButton
                    url={shareUrl}
                    title={`${recipeTitle} · GitGrub`}
                    text={`Check out this recipe on GitGrub: ${recipeTitle}`}
                    className={`${btnBase} border hover:bg-gray-50`}
                />
            </div>
        )
    }

    return (
        <>
            {/* Desktop toolbar */}
            <div className="hidden sm:block my-8 border-t pt-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Actions />

                    {forkedFromId && (
                        <Link
                            to={`/r/${forkedFromId}`}
                            className="text-xs sm:text-sm text-gray-600 underline hover:text-gray-800"
                        >
                            View original
                        </Link>
                    )}

                    <div className="ml-auto" />

                    {/* New Recipe: only if authed */}
                    {showNewRecipe && isAuthed && (
                        <Link
                            to="/recipes/new"
                            className="text-sm bg-gray-900 text-white px-3 py-2 rounded hover:bg-gray-800 active:scale-[0.98] transition"
                        >
                            New Recipe
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile fixed bottom bar via Portal */}
            <MobileActionsPortal>
                <div
                    className="sm:hidden fixed left-0 right-0 bottom-0 z-50 border-t
                     bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60
                     h-14 pb-[max(0px,env(safe-area-inset-bottom))]"
                >
                    <div className="mx-auto max-w-2xl h-full px-3 flex items-center gap-2">
                        <Actions compact />

                        {forkedFromId && (
                            <Link to={`/r/${forkedFromId}`} className="ml-auto text-xs text-gray-700 underline">
                                Original
                            </Link>
                        )}
                    </div>
                </div>
            </MobileActionsPortal>

            {/* Spacer so content isn't covered by mobile bar */}
            <div className="h-14 sm:hidden" />
        </>
    )
}

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRecipeDetail } from '@/hooks/useRecipeDetail'
import VersionsPanel from '@/components/VersionsPanel'
import { useUser } from '@/context/UserContext'
import NotFound from '@/components/NotFound'
import RecipeActions from '@/components/RecipeActions'

export default function RecipeDetail() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, error } = useRecipeDetail(id)
    const { profile } = useUser()

    const recipe = data?.recipe
    // normalize in case SQL returned latestversion (lowercase V)
    const latestVersion = data?.latestVersion ?? (data as any)?.latestversion
    const forks = data?.forks ?? []

    const isOwner = !!recipe && !!profile && recipe.user_id === profile.id

    const [selectedVersion, setSelectedVersion] = useState<typeof latestVersion | null>(null)
    const current = selectedVersion ?? latestVersion
    const currentVersionNo = current?.version_no ?? undefined

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-8 w-2/3 bg-gray-200 rounded" />
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
            </div>
        )
    }

    if (error || !recipe || !current) {
        return (
            <NotFound
                title="Recipe not found"
                description="This recipe may have been deleted or never existed."
                ctaHref="/recipes"
                ctaLabel="Explore Recipes"
            />
        )
    }

    const versionStamp = new Date(current.created_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    })

    return (
        <div className="max-w-2xl mx-auto p-4 pb-4 sm:pb-0 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{recipe.title}</h1>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        {recipe.author?.id ? (
                            <Link
                                to={`/u/${recipe.author.id}`}
                                className="flex items-center gap-2 group"
                            >
                                {recipe.author.avatar_photo ? (
                                    <img
                                        src={recipe.author.avatar_photo}
                                        alt={recipe.author.display_name ?? 'Author'}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                        {(recipe.author?.display_name ?? 'U').slice(0, 1)}
                                    </div>
                                )}
                                <span className="text-sm text-gray-600 group-hover:underline">
                                    {recipe.author.display_name ?? 'Unknown Chef'}
                                </span>
                            </Link>
                        ) : (
                            <span className="text-sm text-gray-600">
                                by {recipe.author?.display_name ?? 'Unknown Chef'}
                            </span>
                        )}

                        <span className="text-gray-300">•</span>

                        <span className="text-xs text-gray-500">{versionStamp}</span>

                        <span className="text-gray-300">•</span>

                        <VersionsPanel
                            recipeId={recipe.id}
                            onSelect={(ver) => setSelectedVersion(ver)}
                            currentVersion={currentVersionNo}
                        />
                    </div>
                </div>

                {/* Tag chips */}
                {(recipe.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap justify-end gap-2">
                        {(recipe.tags ?? []).map((t) => (
                            <span key={t} className="px-2 py-1 text-xs bg-gray-100 rounded-full">{t}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Ingredients */}
            <section key={`ing-${current.version_no}`}>
                <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                {(current.ingredients ?? []).length ? (
                    <ul className="list-disc pl-5 space-y-1">
                        {current.ingredients.map((line: string, i: number) => (
                            <li key={`${current.version_no}-ing-${i}`}>{line}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No ingredients listed.</p>
                )}
            </section>

            {/* Steps */}
            <section key={`steps-${current.version_no}`}>
                <h2 className="text-xl font-semibold mb-2">Steps</h2>
                {(current.steps ?? []).length ? (
                    <ol className="list-decimal pl-5 space-y-2">
                        {current.steps.map((line: string, i: number) => (
                            <li key={`${current.version_no}-step-${i}`}>{line}</li>
                        ))}
                    </ol>
                ) : (
                    <p className="text-gray-500">No steps provided.</p>
                )}
            </section>

            {/* Notes */}
            {current.notes && (
                <section key={`notes-${current.version_no}`}>
                    <h2 className="text-xl font-semibold mb-2">Notes</h2>
                    <p className="text-gray-800 whitespace-pre-wrap">{current.notes}</p>
                </section>
            )}

            {/* Forks */}
            {(forks ?? []).length > 0 && (
                <section className="pt-2">
                    <h2 className="text-lg font-semibold mb-3">
                        Forks <span className="text-gray-500 font-normal">({forks.length})</span>
                    </h2>
                    <ul className="space-y-3">
                        {forks.map((f) => (
                            <li key={f.id}>
                                <Link to={`/r/${f.id}`} className="flex items-center gap-3 group">
                                    {f.author?.avatar_photo ? (
                                        <img src={f.author.avatar_photo} alt={f.author.display_name ?? 'Author'} className="h-6 w-6 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                                            {(f.author?.display_name ?? 'U').slice(0, 1)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium truncate group-hover:underline">{f.title}</div>
                                        <div className="text-xs text-gray-500">
                                            by {f.author?.display_name ?? 'Unknown Chef'} · {new Date(f.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className="ml-auto text-xs text-blue-600 group-hover:underline">View →</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <RecipeActions
                isOwner={isOwner}
                recipeId={recipe.id}
                recipeTitle={recipe.title}
                tags={recipe.tags ?? []}
                forkedFromId={recipe.forked_from}
                likeCount={recipe.like_count}
                likedByMe={recipe.liked_by_me}
                baseVersion={{
                    ingredients: current.ingredients,
                    steps: current.steps,
                    notes: current.notes ?? null,
                }}
            />

        </div>
    )
}

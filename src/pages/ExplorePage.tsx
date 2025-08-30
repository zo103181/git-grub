import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import supabase from '@/lib/supabase'
import RecipeCard, { RecipeCardData } from '@/components/RecipeCard'
import { useDebounce } from '@/hooks/useDebounce'

const PAGE_SIZE = 12
type SortMode = 'newest' | 'liked'

// Parse comma-separated tags from URL param
function readTagsParam(value: string | null): string[] {
    if (!value) return []
    return value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
}

// Build comma-separated tags string for URL param
function writeTagsParam(tags: string[]): string | null {
    const cleaned = tags.map(t => t.trim()).filter(Boolean)
    return cleaned.length ? cleaned.join(',') : null
}

// Case-insensitive de-dup
function addUniqueTag(list: string[], tag: string) {
    const exists = list.some(t => t.toLowerCase() === tag.toLowerCase())
    return exists ? list : [...list, tag]
}

export default function ExplorePage() {
    const [params, setParams] = useSearchParams()

    // URL params
    const sort = (params.get('sort') as SortMode) || 'newest'
    const qParam = params.get('q') ?? ''
    const tagsParam = params.get('tags') ?? '' // comma-separated

    // Local search input (title-only) + debounce
    const [q, setQ] = useState(qParam)
    const qDebounced = useDebounce(q, 300)
    const hasPlainQuery = qDebounced.trim().length >= 2
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Selected tags are derived from URL; no separate state source
    const selectedTags = useMemo(() => readTagsParam(tagsParam), [tagsParam])

    // Keep input synced if URL changes (back/forward)
    useEffect(() => { setQ(qParam) }, [qParam])

    // Reflect debounced title query back to URL (don’t touch tags here)
    useEffect(() => {
        const next = new URLSearchParams(params)
        if (hasPlainQuery) next.set('q', qDebounced.trim())
        else next.delete('q')

        if (next.toString() !== params.toString()) {
            setParams(next, { replace: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qDebounced, hasPlainQuery])

    // Helpers to update URL tags
    const updateTagsInUrl = (tags: string[]) => {
        const next = new URLSearchParams(params)
        const payload = writeTagsParam(tags)
        if (payload) next.set('tags', payload)
        else next.delete('tags')

        // clean up any legacy ?tag=
        next.delete('tag')

        setParams(next, { replace: true })
    }

    const addTagChip = (tag: string) => {
        const normalized = tag.trim()
        if (!normalized) return
        updateTagsInUrl(addUniqueTag(selectedTags, normalized))
        inputRef.current?.focus()
    }

    const removeTagChip = (tag: string) => {
        const filtered = selectedTags.filter(t => t.toLowerCase() !== tag.toLowerCase())
        updateTagsInUrl(filtered)
    }

    const clearAllTags = () => updateTagsInUrl([])

    // Data state
    const [recipes, setRecipes] = useState<RecipeCardData[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(0)

    const mapRow = (rec: any): RecipeCardData => {
        const a = Array.isArray(rec.author) ? rec.author[0] ?? null : rec.author ?? null
        return {
            id: rec.id,
            title: rec.title,
            tags: rec.tags ?? [],
            created_at: rec.created_at,
            likeCount: rec.like_count ?? 0,
            author: a
                ? { id: a.id, display_name: a.display_name ?? 'Unknown Chef', avatar_photo: a.avatar_photo ?? null }
                : null,
        }
    }

    const load = async (pageIndex: number) => {
        const from = pageIndex * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        let query = supabase
            .from('recipes')
            .select(`
        id, user_id, title, tags, forked_from, created_at, updated_on,
        like_count, fork_count, version_count,
        author:users!recipes_user_id_fkey ( id, display_name, avatar_photo )
      `)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (selectedTags.length > 0) {
            // assuming tags are stored lowercased in DB
            query = query.overlaps('tags', selectedTags.map(t => t.toLowerCase()))
        }
        if (hasPlainQuery) {
            query = query.ilike('title', `%${qDebounced}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return (data ?? []).map(mapRow)
    }

    // Fetch on changes
    const depsKey = useMemo(
        () => [sort, qDebounced, hasPlainQuery, tagsParam].join('|'),
        [sort, qDebounced, hasPlainQuery, tagsParam]
    )

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    setLoading(true); setError(null); setPage(0)
                    const first = await load(0)
                    if (!mounted) return
                    const sorted =
                        sort === 'liked'
                            ? [...first].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
                            : first
                    setRecipes(sorted)
                } catch (e: any) {
                    if (!mounted) return
                    setError(e?.message ?? 'Failed to load recipes')
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
        return () => { mounted = false }
    }, [depsKey])

    const loadMore = async () => {
        try {
            setLoadingMore(true)
            const nextPage = page + 1
            const next = await load(nextPage)
            const merged = [...recipes, ...next]
            const resorted =
                sort === 'liked'
                    ? merged.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
                    : merged
            setRecipes(resorted)
            setPage(nextPage)
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load more')
        } finally {
            setLoadingMore(false)
        }
    }

    const setSort = (mode: SortMode) => {
        const next = new URLSearchParams(params)
        next.set('sort', mode)
        setParams(next, { replace: true })
    }

    return (
        <div className="mx-auto max-w-6xl p-4">
            {/* Header */}
            <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">Explore Recipes</h1>

                {/* Sort */}
                <label className="ml-auto flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Sort</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortMode)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="newest">Newest</option>
                        <option value="liked">Most Liked</option>
                    </select>
                </label>

                <div className="relative">
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search titles (min 2 chars)…"
                        className="border rounded pl-3 pr-8 py-2 text-sm"
                        aria-label="Search recipes by title"
                    />
                    {q && (
                        <button
                            onClick={() => setQ('')}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            &times;
                        </button>
                    )}
                </div>

                <Link to="/recipes/new" className="text-sm bg-gray-900 text-white px-3 py-2 rounded hover:bg-gray-800">
                    New Recipe
                </Link>
            </div>

            {/* Selected tag chips */}
            {selectedTags.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {selectedTags.map(tk => (
                        <span
                            key={tk.toLowerCase()}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs"
                            title={`Filter by ${tk}`}
                        >
                            {tk}
                            <button
                                onClick={() => removeTagChip(tk)}
                                className="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                                aria-label={`Remove tag ${tk}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={clearAllTags}
                        className="text-xs text-gray-600 underline cursor-pointer"
                        aria-label="Clear all tags"
                    >
                        Clear tags
                    </button>
                </div>
            )}

            <div className="pb-6"></div>

            {/* Grid / states */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : recipes.length === 0 ? (
                <div className="text-gray-700">
                    {hasPlainQuery || selectedTags.length > 0 ? (
                        <>No results for your filters.</>
                    ) : (
                        <>No recipes yet. Be the first to <Link to="/recipes/new" className="text-blue-600 underline">create one</Link>.</>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recipes.map((r) => (
                            <RecipeCard
                                key={r.id}
                                data={r}
                                onTagClick={(t) => addTagChip(t)}
                            />
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
                        >
                            {loadingMore ? 'Loading ...' : 'Load More'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

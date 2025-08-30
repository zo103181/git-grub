import supabase from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

type Version = {
    id: string
    recipe_id: string
    version_no: number
    ingredients: string[]
    steps: string[]
    notes: string | null
    created_at: string
    updated_on: string
}

export default function VersionsPanel({
    recipeId,
    onSelect,        // callback to deliver the selected version
    currentVersion,  // version_no currently displayed (optional, for badge)
}: {
    recipeId: string
    onSelect: (v: Version) => void
    currentVersion?: number
}) {
    const [versions, setVersions] = useState<Version[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [params] = useSearchParams()
    const nav = useNavigate()

    useEffect(() => {
        let mounted = true
            ; (async () => {
                setLoading(true)
                setError(null)
                const { data, error } = await supabase
                    .from('recipe_versions')
                    .select('*')
                    .eq('recipe_id', recipeId)
                    .order('version_no', { ascending: false })
                if (mounted) {
                    if (error) setError(error.message)
                    else setVersions(data ?? [])
                    setLoading(false)
                }
            })()
        return () => { mounted = false }
    }, [recipeId])

    // Pick initial version based on ?v=, else latest
    useEffect(() => {
        if (!versions.length) return
        const paramV = Number(params.get('v') ?? 0)
        const initial = paramV
            ? versions.find(v => v.version_no === paramV) ?? versions[0]
            : versions[0]
        onSelect(initial)
    }, [versions]) // eslint-disable-line

    const onPick = (v: Version) => {
        onSelect(v)
        const url = new URL(window.location.href)
        url.searchParams.set('v', `${v.version_no}`)
        nav(`${url.pathname}${url.search}`, { replace: true })
    }

    if (loading) {
        return <div className="text-sm text-gray-500">Loading versions…</div>
    }
    if (error) {
        return <div className="text-sm text-red-600">Error loading versions: {error}</div>
    }
    if (!versions.length) {
        return <div className="text-sm text-gray-500">No versions yet.</div>
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {versions.map(v => (
                <button
                    key={v.id}
                    onClick={() => onPick(v)}
                    className={`text-xs px-2 py-1 rounded border transition
            ${currentVersion === v.version_no ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    title={new Date(v.created_at).toLocaleString()}
                >
                    v{v.version_no}
                </button>
            ))}
        </div>
    )
}
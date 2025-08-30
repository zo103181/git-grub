import { useNavigate } from 'react-router-dom'

type BaseVersion = {
    ingredients: string[]
    steps: string[]
    notes: string | null
}

export default function ForkButton({
    recipeId, title, tags, baseVersion, className = ''
}: {
    recipeId: string
    title: string
    tags: string[]
    baseVersion: BaseVersion
    className?: string
}) {
    const nav = useNavigate()
    return (
        <button
            onClick={() => nav(`/r/${recipeId}/fork`, {
                state: { sourceTitle: title, sourceTags: tags, baseVersion }
            })}
            className={`text-sm border px-3 py-2 rounded disabled:opacity-60 cursor-pointer ${className}`}
            title="Create a new recipe starting from the current version"
        >
            Fork
        </button>
    )
}

import { useEffect, useMemo, useState } from 'react'

export type RecipeFormValues = {
    title: string
    tags: string[]
    ingredientsText: string
    stepsText: string
    notes: string
}

export default function RecipeForm({
    mode = 'create',
    allowMetaEdit = true,
    initial,
    onSubmit,
    onCancel,
    submitLabel,
    busy = false,
}: {
    mode?: 'create' | 'edit'
    allowMetaEdit?: boolean
    initial: RecipeFormValues
    onSubmit: (values: RecipeFormValues) => Promise<void>
    onCancel?: () => void
    submitLabel: string
    busy?: boolean
}) {
    const [title, setTitle] = useState(initial.title)
    const [tags, setTags] = useState(initial.tags.join(', '))
    const [ingredients, setIngredients] = useState(initial.ingredientsText)
    const [steps, setSteps] = useState(initial.stepsText)
    const [notes, setNotes] = useState(initial.notes)
    const [err, setErr] = useState<string | null>(null)

    // Keep inputs in sync when `initial` arrives asynchronously
    useEffect(() => {
        setTitle(initial.title)
        setTags(initial.tags.join(', '))
        setIngredients(initial.ingredientsText)
        setSteps(initial.stepsText)
        setNotes(initial.notes)
    }, [initial])

    // Dirty check
    const isDirty = useMemo(() => {
        const norm = (s: string) => s.replace(/\r\n/g, '\n')
        return (
            title !== initial.title ||
            tags !== initial.tags.join(', ') ||
            norm(ingredients) !== norm(initial.ingredientsText) ||
            norm(steps) !== norm(initial.stepsText) ||
            notes !== initial.notes
        )
    }, [title, tags, ingredients, steps, notes, initial])

    // Warn on tab close/refresh if dirty
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!isDirty) return
            e.preventDefault()
            e.returnValue = '' // Chrome requires returnValue to show prompt
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr(null)

        const trimmedTitle = title.trim()
        if (!trimmedTitle) return setErr('Title is required')

        const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean)

        await onSubmit({
            title: trimmedTitle,
            tags: parsedTags,
            ingredientsText: ingredients,
            stepsText: steps,
            notes,
        })
    }

    const handleCancel = () => {
        if (isDirty) {
            const ok = window.confirm('Discard your changes?')
            if (!ok) return
        }
        onCancel?.()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {allowMetaEdit && (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Spaghetti Aglio e Olio"
                            disabled={busy || (mode === 'edit' && !allowMetaEdit)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={tags}
                            onChange={e => setTags(e.target.value)}
                            placeholder="italian, pasta, quick"
                            disabled={busy || (mode === 'edit' && !allowMetaEdit)}
                        />
                    </div>
                </>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Ingredients (one per line)</label>
                <textarea
                    className="w-full border p-2 rounded min-h-[120px]"
                    value={ingredients}
                    onChange={e => setIngredients(e.target.value)}
                    disabled={busy}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Steps (one per line)</label>
                <textarea
                    className="w-full border p-2 rounded min-h-[140px]"
                    value={steps}
                    onChange={e => setSteps(e.target.value)}
                    disabled={busy}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                    className="w-full border p-2 rounded min-h-[80px]"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    disabled={busy}
                />
            </div>

            {err && <p className="text-sm text-rose-600">{err}</p>}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={busy}
                    className="bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-60 cursor-pointer"
                >
                    {busy ? 'Saving…' : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="border px-4 py-2 rounded hover:bg-gray-50 cursor-pointer"
                    disabled={busy}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

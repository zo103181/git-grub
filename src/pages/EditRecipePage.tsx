// src/pages/EditRecipePage.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import supabase from '@/lib/supabase'
import RecipeForm, { RecipeFormValues } from '@/components/RecipeForm'

type Version = {
    version_no: number
    ingredients: string[]
    steps: string[]
    notes: string | null
}

export default function EditRecipePage() {
    const { id } = useParams<{ id: string }>()
    const nav = useNavigate()

    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isOwner, setIsOwner] = useState(false)

    const [initial, setInitial] = useState<RecipeFormValues>({
        title: '',
        tags: [],
        ingredientsText: '',
        stepsText: '',
        notes: '',
    })
    const [currentNo, setCurrentNo] = useState(1)

    useEffect(() => {
        let mounted = true
        if (!id) return

            ; (async () => {
                try {
                    setError(null)

                    // recipe for title/tags + ownership
                    const { data: rec, error: rErr } = await supabase
                        .from('recipes')
                        .select('id,user_id,title,tags')
                        .eq('id', id)
                        .single()
                    if (rErr || !rec) throw rErr ?? new Error('Recipe not found')

                    const { data: session } = await supabase.auth.getSession()
                    const uid = session?.session?.user?.id
                    const owner = !!uid && uid === rec.user_id
                    setIsOwner(owner)
                    if (!owner) throw new Error('You do not have permission to edit this recipe.')

                    // latest version
                    const { data: ver, error: vErr } = await supabase
                        .from('recipe_versions')
                        .select('version_no,ingredients,steps,notes')
                        .eq('recipe_id', rec.id)
                        .order('version_no', { ascending: false })
                        .limit(1)
                        .single<Version>()
                    if (vErr || !ver) throw vErr ?? new Error('No versions found')

                    if (!mounted) return
                    setCurrentNo(ver.version_no)
                    setInitial({
                        title: rec.title,
                        tags: rec.tags ?? [],
                        ingredientsText: (ver.ingredients ?? []).join('\n'),
                        stepsText: (ver.steps ?? []).join('\n'),
                        notes: ver.notes ?? '',
                    })
                } catch (e: any) {
                    setError(e?.message ?? 'Failed to load recipe')
                }
            })()

        return () => { mounted = false }
    }, [id])

    const onSubmit = async (v: RecipeFormValues) => {
        if (!id) return
        setBusy(true)
        try {
            // OPTIONAL: allow updating recipe meta (title/tags).
            // If you want to lock meta, set allowMetaEdit={false} below and skip this block.
            const { error: mErr } = await supabase
                .from('recipes')
                .update({ title: v.title, tags: v.tags })
                .eq('id', id)
            if (mErr) throw mErr

            // Insert NEW version
            const ingredients = v.ingredientsText.split('\n').map(s => s.trim()).filter(Boolean)
            const steps = v.stepsText.split('\n').map(s => s.trim()).filter(Boolean)

            const { data: inserted, error: iErr } = await supabase
                .from('recipe_versions')
                .insert({
                    recipe_id: id,
                    version_no: 0, // trigger assigns next
                    ingredients,
                    steps,
                    notes: v.notes || null,
                })
                .select('version_no')
                .single()
            if (iErr) throw iErr

            const newNo = inserted?.version_no ?? currentNo + 1
            nav(`/r/${id}?v=${newNo}`)
        } catch (e: any) {
            alert(e?.message ?? 'Failed to save changes')
        } finally {
            setBusy(false)
        }
    }

    if (error) return <div className="p-4 text-rose-600">{error}</div>
    if (!isOwner) return <div className="p-4 text-rose-600">Unauthorized</div>

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-1">Edit Recipe</h1>
            <p className="text-sm text-gray-600 mb-4">Creating v{currentNo + 1}</p>

            <RecipeForm
                mode="edit"
                allowMetaEdit={true}
                busy={busy}
                submitLabel="Save New Version"
                initial={initial}
                onSubmit={onSubmit}
                onCancel={() => nav(`/r/${id}`)}
            />
        </div>
    )
}

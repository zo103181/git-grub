import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import supabase from '@/lib/supabase'
import RecipeForm, { RecipeFormValues } from '@/components/RecipeForm'

export default function ForkRecipePage() {
    const { id: sourceId } = useParams<{ id: string }>()
    const { state } = useLocation() as {
        state?: {
            sourceTitle?: string
            sourceTags?: string[]
            baseVersion?: { ingredients: string[]; steps: string[]; notes: string | null }
        }
    }
    const nav = useNavigate()
    const [busy, setBusy] = useState(false)

    const initial = useMemo<RecipeFormValues>(() => ({
        title: state?.sourceTitle ? `Fork of ${state.sourceTitle}` : 'Forked Recipe',
        tags: state?.sourceTags ?? [],
        ingredientsText: (state?.baseVersion?.ingredients ?? []).join('\n'),
        stepsText: (state?.baseVersion?.steps ?? []).join('\n'),
        notes: state?.baseVersion?.notes ?? '',
    }), [state])

    const onSubmit = async (v: RecipeFormValues) => {
        if (!sourceId) return
        setBusy(true)
        let createdRecipeId: string | null = null

        try {
            const { data: session } = await supabase.auth.getSession()
            const uid = session?.session?.user?.id
            if (!uid) throw new Error('You must be signed in.')

            // 1) Create the new recipe pointing to the source (self-fork allowed)
            const { data: rec, error: rErr } = await supabase
                .from('recipes')
                .insert({
                    user_id: uid,
                    title: v.title.trim(),
                    tags: v.tags,
                    forked_from: sourceId,
                })
                .select('id')
                .single()
            if (rErr || !rec) throw rErr ?? new Error('Could not create recipe')
            createdRecipeId = rec.id

            // 2) Insert v1 with your edited content
            const ingredients = v.ingredientsText.split('\n').map(s => s.trim()).filter(Boolean)
            const steps = v.stepsText.split('\n').map(s => s.trim()).filter(Boolean)

            const { error: vErr } = await supabase
                .from('recipe_versions')
                .insert({
                    recipe_id: rec.id,
                    // let trigger assign version_no = 1
                    ingredients,
                    steps,
                    notes: v.notes || null,
                })
            if (vErr) throw vErr

            // 3) Go to new recipe
            nav(`/r/${rec.id}`)
        } catch (e: any) {
            // If recipe was created but v1 failed, clean up
            if (createdRecipeId) {
                await supabase.from('recipes').delete().eq('id', createdRecipeId)
            }
            alert(e?.message ?? 'Failed to fork')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-1">Fork & Edit</h1>
            <p className="text-sm text-gray-600 mb-4">
                Start a new recipe from this version. Your changes will be saved as <strong>v1</strong>.
            </p>
            <RecipeForm
                mode="create"
                allowMetaEdit
                busy={busy}
                submitLabel="Create fork (v1)"
                initial={initial}
                onSubmit={onSubmit}
                onCancel={() => nav(-1)}
            />
        </div>
    )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/lib/supabase'
import RecipeForm, { RecipeFormValues } from '@/components/RecipeForm'

export default function NewRecipePage() {
    const nav = useNavigate()
    const [busy, setBusy] = useState(false)

    const onSubmit = async (v: RecipeFormValues) => {
        setBusy(true)
        try {
            const { data: session } = await supabase.auth.getSession()
            const uid = session?.session?.user?.id
            if (!uid) throw new Error('Not signed in')

            // Create recipe
            const { data: recipe, error: rErr } = await supabase
                .from('recipes')
                .insert({ user_id: uid, title: v.title, tags: v.tags })
                .select()
                .single()
            if (rErr || !recipe) throw rErr ?? new Error('Error creating recipe')

            // First version
            const ingredients = v.ingredientsText.split('\n').map(s => s.trim()).filter(Boolean)
            const steps = v.stepsText.split('\n').map(s => s.trim()).filter(Boolean)

            const { error: vErr } = await supabase
                .from('recipe_versions')
                .insert({ recipe_id: recipe.id, ingredients, steps, notes: v.notes || null })
            if (vErr) throw vErr

            nav(`/r/${recipe.id}`)
        } catch (e: any) {
            alert(e?.message ?? 'Failed to create recipe')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">New Recipe</h1>
            <RecipeForm
                mode="create"
                allowMetaEdit
                busy={busy}
                submitLabel="Create"
                initial={{
                    title: '',
                    tags: [],
                    ingredientsText: '',
                    stepsText: '',
                    notes: '',
                }}
                onSubmit={onSubmit}
                onCancel={() => nav(`/recipes`)}
            />
        </div>
    )
}

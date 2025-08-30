import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/lib/supabase'
import { useModalDialogAlert } from '@/context/ModalDialogAlertContext'
import { useNotification } from '@/hooks/useNotification'

export default function DeleteRecipeButton({
    recipeId,
    recipeTitle,
    className = '',
    afterDeletePath = '/recipes',
}: {
    recipeId: string
    recipeTitle?: string
    className?: string
    afterDeletePath?: string
}) {
    const [busy, setBusy] = useState(false)
    const { confirm } = useModalDialogAlert()
    const nav = useNavigate()
    const { showNotification } = useNotification()

    const onDelete = async () => {
        if (busy) return
        const ok = await confirm({
            type: 'error',
            title: 'Confirm Deletion',
            message: `Delete “${recipeTitle ?? 'this recipe'}”? This cannot be undone.`,
            actionText: busy ? 'Deleting…' : 'Delete',
        })
        if (!ok) return
        setBusy(true)
        try {
            const { error } = await supabase.from('recipes').delete().eq('id', recipeId)
            if (error) throw error
            nav(afterDeletePath)
        } catch (e: any) {
            showNotification({ type: 'error', message: 'Delete failed', description: e.message ?? 'Unknown error' })
        } finally {
            setBusy(false)
        }
    }

    return (
        <button
            onClick={onDelete}
            disabled={busy}
            className={`cursor-pointer text-sm border border-rose-200 text-rose-700 px-3 py-2 rounded hover:bg-rose-50 disabled:opacity-60 ${className}`}
            title="Delete this recipe permanently"
        >
            {busy ? 'Deleting ...' : 'Delete'}
        </button>
    )
}

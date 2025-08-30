import { useQuery } from '@tanstack/react-query'
import supabase from '@/lib/supabase'

export type RpcAuthor = {
    id: string
    display_name: string | null
    avatar_photo: string | null
    follower_count?: number
    following_count?: number
    followed_by_me?: boolean
}

export type RpcRecipe = {
    id: string
    user_id: string
    title: string
    tags: string[] | null
    forked_from: string | null
    created_at: string
    updated_on: string
    like_count: number
    version_count: number
    fork_count: number
    liked_by_me: boolean
    author: RpcAuthor | null
}

export type RpcVersion = {
    id: string
    recipe_id: string
    version_no: number
    ingredients: string[]
    steps: string[]
    notes: string | null
    created_at: string
    updated_on: string
}

export type RpcFork = {
    id: string
    title: string
    created_at: string
    author: RpcAuthor | null
}

type RawDetail =
    & { recipe: RpcRecipe; forks: RpcFork[] }
    & { latestVersion?: RpcVersion; latestversion?: RpcVersion } // some drivers lowercase camel

export function useRecipeDetail(recipeId: string | undefined) {
    return useQuery({
        queryKey: ['recipeDetail', recipeId],
        enabled: !!recipeId,
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_recipe_detail', { p_recipe_id: recipeId })
            if (error) throw error

            const raw = data as RawDetail
            // normalize key so callers always use `latestVersion`
            const latestVersion = raw.latestVersion ?? raw.latestversion
            return { recipe: raw.recipe, latestVersion, forks: raw.forks }
        },
        staleTime: 1000 * 60 * 10,
    })
}

import { useQuery } from '@tanstack/react-query'
import supabase from '@/lib/supabase'

export type RpcAuthor = { id: string; display_name: string | null; avatar_photo: string | null }
export type RpcRecipe = {
    id: string; user_id: string; title: string; tags: string[] | null;
    forked_from: string | null; created_at: string; updated_on: string;
    like_count: number; version_count: number; fork_count: number;
    liked_by_me: boolean;
    author: RpcAuthor | null;
}
export type RpcVersion = {
    id: string; recipe_id: string; version_no: number;
    ingredients: string[]; steps: string[]; notes: string | null;
    created_at: string; updated_on: string;
}
export type RpcFork = {
    id: string; title: string; created_at: string; author: RpcAuthor | null
}

export function useRecipeDetail(recipeId: string | undefined) {
    return useQuery({
        queryKey: ['recipeDetail', recipeId],
        enabled: !!recipeId,
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_recipe_detail', { p_recipe_id: recipeId })
            if (error) throw error
            return data as { recipe: RpcRecipe; latestversion: RpcVersion } & { latestVersion?: RpcVersion; forks: RpcFork[] }
        },
        staleTime: 1000 * 60 * 10,
    })
}

import supabase from '../lib/supabase';

export async function signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin } });
}
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { User as SupabaseAuthUser } from "@supabase/supabase-js"
import { PostgresUser } from "../types/User/PostgresUser";
import { useNotification } from "@/hooks/useNotification";

interface UserContextType {
    authUser: SupabaseAuthUser | null;
    profile: PostgresUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    updateProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    authUser: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    updateProfile: async () => { },
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { showNotification } = useNotification();
    const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
    const [profile, setProfile] = useState<PostgresUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSessionAndProfile = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            const user = session?.user ?? null;
            setAuthUser(user);

            if (user) {
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error("Error fetching profile:", error);
                } else {
                    setProfile(data);
                }
            }

            setLoading(false);
        };

        getSessionAndProfile();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            getSessionAndProfile();
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const updateProfile = async () => {
        const user = authUser;
        if (!user) return;

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Error refreshing profile:", error);
        } else {
            setProfile(data);
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            showNotification({
                type: 'error',
                message: error.name,
                description: error.message
            });
            return;
        }

        setProfile(null);
        setAuthUser(null);
    };

    return (
        <UserContext.Provider value={{ authUser, profile, loading, updateProfile, signOut }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
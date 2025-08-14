import { useEffect, useState } from "react";
import { signInWithGoogle } from "./authService"
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useNotification } from "../hooks/useNotification";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function AuthPage() {
    const { profile } = useUser();
    const [authLoading, setAuthLoading] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        if (profile) {
            navigate("/dashboard");
        }
    }, [profile, navigate]);

    const handleSignIn = async () => {
        setAuthLoading(true);

        if (profile) {
            showNotification({
                type: 'success',
                message: `Welcome ${profile.display_name}`,
                description: `You are already logged in. Feel free to move around the cabin.`,
            });
            setAuthLoading(false);
            return;
        }

        const { error } = await signInWithGoogle();
        if (error) {
            showNotification({
                type: 'error',
                message: 'Authentication Errors',
                description: error.message,
            });
            setAuthLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white">
                <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20 pt-14">
                    <div
                        aria-hidden="true"
                        className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-blue-600/10 ring-1 ring-blue-50 sm:-mr-80 lg:-mr-96"
                    />
                    <div className="mx-auto max-w-7xl px-6 pt-2 pb-32 sm:py-40 lg:px-8">
                        <h1 className="relative inline-block text-5xl font-bold text-gray-900 mb-4">
                            Vite React Tailwind Supabase Starter
                        </h1>
                        <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
                            <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
                                <p className="text-lg leading-8 text-gray-600 py-3">🚀 Welcome to Your Next Frontend Adventure!</p>
                                <p className="text-md leading-8 text-gray-600 py-1">Kickstart your project with Vite, React, and TailwindCSS - a modern, fast, and flexible stack designed to help you build sleek, responsive interfaces with ease.</p>
                                <p className="text-md leading-8 text-gray-600 py-1">Whether you're prototyping, building a SaaS, or crafting a portfolio, this starter kit gives you a solid foundation to move fast and scale confidently.</p>
                                <p className="text-md leading-8 text-gray-600 py-1">Happy coding! 💻✨</p>
                                <div className="mt-10 flex flex-col gap-4">
                                    <div className="flex flex-col items-center w-full">
                                        <GoogleSignInButton onClick={handleSignIn} loading={authLoading} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
                </div>
            </div>
        </>
    )
}

export default AuthPage
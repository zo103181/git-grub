import { ChangeEvent, FormEvent, useState } from "react";
import { BaseUser, ResponseUser } from "@/types/User";
import useFileStaging from "@/hooks/useFileStaging";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { useNotification } from "@/hooks/useNotification";
import { useUser } from "@/context/UserContext";
import supabase from "@/lib/supabase";
import { mapBaseUserToPostgresUser } from "@/mappers/userMappers";

interface SettingsFormProps {
    user: ResponseUser;
}

export default function SettingsForm({ user }: SettingsFormProps) {
    const { updateProfile, signOut } = useUser();
    const { showNotification } = useNotification();

    const {
        handleFileStaged,
        handleFileStagedDelete,
        processStagedFiles,
        filePreviews,
        stagedForDeletion,
        clearAllStagedFiles
    } = useFileStaging();

    const [form, setForm] = useState<BaseUser>({
        displayName: user.displayName,
        username: user.username,
        avatarPhoto: user.avatarPhoto,
        coverPhoto: user.coverPhoto,
        email: user.email,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updatedPhotos = await processStagedFiles();
            console.log('updatedPhotos', updatedPhotos);

            const updatedForm = {
                ...form,
                ...updatedPhotos
            };

            const payload = mapBaseUserToPostgresUser(updatedForm);

            console.log({ payload });

            const { error } = await supabase
                .from("users")
                .update(payload)
                .eq("id", user.userId);

            if (error) {
                throw new Error(error.message);
            }

            await updateProfile();
            showNotification({
                type: "success",
                message: "Profile updated successfully!",
            });
        } catch (err: any) {
            showNotification({
                type: "error",
                message: "Update Failed",
                description: err.message || "Something went wrong during upload or save.",
            });
        } finally {
            setLoading(false);
            clearAllStagedFiles();
        }
    };

    return (
        <>
            <ProfileHeader
                source={user}
                displayName={form.displayName}
                displaySubName={form.email}
                avatarPhotoType="UserAvatarPhoto"
                coverPhotoType="UserCoverPhoto"
                isUploading={{ avatar: false, coverPhoto: false }}
                onFileSelected={handleFileStaged}
                onFileDelete={handleFileStagedDelete}
                filePreviews={filePreviews}
                stagedForDeletion={stagedForDeletion}
            />

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                    <label className="block text-sm font-medium">Display Name</label>
                    <input
                        name="displayName"
                        value={form.displayName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Username</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
                >
                    {loading ? "Saving ..." : "Save"}
                </button>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="bg-white border-red-600 border text-red-600 px-4 py-2 ml-2 rounded hover:bg-red-100 cursor-pointer"
                >
                    Sign Out
                </button>
            </form>
        </>
    );
}

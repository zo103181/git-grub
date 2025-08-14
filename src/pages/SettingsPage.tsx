import { mapPostgresUserToResponseUser } from "@/mappers/userMappers";
import SettingsForm from "@/components/settings/SettingsForm";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
    const { authUser, profile } = useUser();

    if (!authUser) return <p>Loading ...</p>;

    return (
        <>
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                {profile && <SettingsForm user={mapPostgresUserToResponseUser(profile)} />}
            </div>
        </>
    );
}

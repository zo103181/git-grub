import { useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { generateStoragePath } from '@/lib/utils/generateStoragePath';
import { useUser } from '@/context/UserContext';
import { cacheImage, deleteCachedImage } from '@/lib/cache/applicationCache';
import { ImageType, ImageTypes } from '@/types/ImageType';

const useFileStorage = () => {
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<Error | null>(null);
    const { authUser } = useUser();

    const uploadFile = useCallback(
        async (file: File, imageType: ImageType, imageSourceId: string, bucketName: string) => {
            if (!authUser?.id) throw new Error('User not authenticated');

            try {
                const path = generateStoragePath(imageType, imageSourceId, authUser.id, file.name);
                console.log('uploadFile (generateStoragePath):', { path });

                setProgress(0);
                setError(null);

                const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, file, {
                    upsert: true,
                    contentType: file.type,
                });

                if (uploadError) throw uploadError;
                setProgress(100);

                const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(path);
                const baseUrl = publicData.publicUrl;

                const versionedUrl = `${baseUrl}?v${Date.now()}`;

                await deleteCachedImage(imageType, imageSourceId);
                await cacheImage(imageType, imageSourceId, file, versionedUrl);

                return versionedUrl;
            } catch (err) {
                console.error(err);
                setError(err as Error);
                throw err;
            }
        },
        [authUser]
    );

    const deleteFile = useCallback(
        async (
            imageType: ImageType,
            imageSourceId: string,
            bucketName: string,
            publicUrl?: string
        ) => {
            if (!authUser?.id) throw new Error('User not authenticated');

            try {
                const folder = ImageTypes[imageType].storageFolder;

                let fullPath: string;

                if (publicUrl) {
                    // Extract just the filename from the full public URL
                    const urlParts = publicUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1].split('?')[0];
                    fullPath = `${folder}/${fileName}`;
                } else {
                    throw new Error('Public URL is required for accurate file deletion.');
                }

                const { error: deleteError } = await supabase.storage.from(bucketName).remove([fullPath]);
                if (deleteError) throw deleteError;

                await deleteCachedImage(imageType, imageSourceId);
            } catch (err) {
                console.error('Error deleting file:', err);
                setError(err as Error);
                throw err;
            }
        },
        [authUser]
    );

    return { uploadFile, deleteFile, progress, error };
};

export default useFileStorage;

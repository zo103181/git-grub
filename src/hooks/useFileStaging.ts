import { useState, useCallback } from 'react';
import { ImageField, ImageStagedForDeletion, ImageType } from '../types/ImageType';
import { useUser } from '../context/UserContext';
import useFileStorage from './useFileStorage';
import { isSupabaseUrl } from '@/lib/supabase';

interface StagedFile {
    file: File | null;
    imageType: ImageType;
    imageSourceId: string;
    bucketName: string;
}

const useFileStaging = () => {
    const { uploadFile, deleteFile } = useFileStorage();
    const { authUser } = useUser();

    const [stagedFiles, setStagedFiles] = useState<Partial<Record<ImageField, StagedFile>>>({});
    const [filePreviews, setFilePreviews] = useState<Partial<Record<ImageField, string | null>>>({});
    const [stagedForDeletion, setStagedForDeletion] = useState<Partial<Record<ImageField, ImageStagedForDeletion>>>({});

    const handleFileStaged = useCallback((
        imageKey: ImageField,
        imageType: ImageType,
        imageSourceId: string,
        file: File,
        previewUrl: string,
        bucketName: string
    ) => {
        console.log('handleFileStaged:', { imageKey, imageType, imageSourceId, file, previewUrl, bucketName });
        setStagedFiles((prev) => ({
            ...prev,
            [imageKey]: { file, imageType, imageSourceId, bucketName },
        }));
        setFilePreviews((prev) => ({
            ...prev,
            [imageKey]: previewUrl,
        }));
    }, []);

    const clearStagedFile = useCallback((imageKey: ImageField) => {
        setStagedFiles((prev) => {
            const newState = { ...prev };
            delete newState[imageKey];
            return newState;
        });
        setFilePreviews((prev) => {
            const newState = { ...prev };
            delete newState[imageKey];
            return newState;
        });
    }, []);

    const handleFileStagedDelete = useCallback((
        imageKey: ImageField,
        imageType: ImageType,
        imageSourceId: string,
        previewUrl: string,
        bucketName: string
    ) => {
        setStagedForDeletion((prev) => ({
            ...prev,
            [imageKey]: {
                imageKey,
                imageType,
                imageSourceId,
                previewUrl,
                bucketName
            },
        }));

        clearStagedFile(imageKey);
    }, [clearStagedFile]);

    const clearAllStagedFiles = useCallback(() => {
        setStagedFiles({});
        setFilePreviews({});
        setStagedForDeletion({});
    }, []);

    const processStagedFiles = useCallback(async () => {
        if (!authUser?.id) throw new Error("User not authenticated");

        let updatedPhotos = {}

        if (stagedForDeletion.avatarPhoto) {
            const { imageKey, imageType, imageSourceId, previewUrl, bucketName } = stagedForDeletion.avatarPhoto;
            const shouldDeleteFromSupabase = isSupabaseUrl(previewUrl);

            try {
                if (shouldDeleteFromSupabase) {
                    await deleteFile(imageType, imageSourceId, bucketName, previewUrl);
                    updatedPhotos = { ...updatedPhotos, avatarPhoto: null }
                }
            } catch (error) {
                console.error(`Error deleting file for ${imageKey}:`, error);
            }
        }

        if (stagedForDeletion.coverPhoto) {
            const { imageKey, imageType, imageSourceId, previewUrl, bucketName } = stagedForDeletion.coverPhoto;
            const shouldDeleteFromSupabase = isSupabaseUrl(previewUrl);

            try {
                if (shouldDeleteFromSupabase) {
                    await deleteFile(imageType, imageSourceId, bucketName, previewUrl);
                    updatedPhotos = { ...updatedPhotos, coverPhoto: null }
                }
            } catch (error) {
                console.error(`Error deleting file for ${imageKey}:`, error);
            }
        }

        if (stagedFiles.avatarPhoto) {
            const { file, imageType, imageSourceId, bucketName } = stagedFiles.avatarPhoto;
            if (file) {
                const publicUrl = await uploadFile(file, imageType, imageSourceId, bucketName);
                if (publicUrl) updatedPhotos = { ...updatedPhotos, avatarPhoto: publicUrl };
            }
        }

        if (stagedFiles.coverPhoto) {
            const { file, imageType, imageSourceId, bucketName } = stagedFiles.coverPhoto;
            if (file) {
                const publicUrl = await uploadFile(file, imageType, imageSourceId, bucketName);
                if (publicUrl) updatedPhotos = { ...updatedPhotos, coverPhoto: publicUrl };
            }
        }

        console.log({ stagedFiles, stagedForDeletion, updatedPhotos });

        return updatedPhotos;
    }, [uploadFile, deleteFile, authUser, stagedFiles, stagedForDeletion]);

    return {
        stagedFiles,
        filePreviews,
        handleFileStaged,
        handleFileStagedDelete,
        clearStagedFile,
        clearAllStagedFiles,
        processStagedFiles,
        stagedForDeletion
    };
};

export default useFileStaging;

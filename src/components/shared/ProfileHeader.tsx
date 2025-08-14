import { FC, useState } from 'react';
import { useProfileImages } from '@/hooks/useProfileImages';
import { ArrowPathIcon, CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ImageField, ImageStagedForDeletion, ImageType, ImageTypes, SharedImageSource } from '@/types/ImageType';
import ImageUpload from './ImageUpload';

interface ProfileHeaderProps {
    source: SharedImageSource;
    avatarPhotoType: ImageType;
    coverPhotoType: ImageType;
    displayName: string;
    displaySubName?: string;
    isUploading?: {
        avatar: boolean;
        coverPhoto: boolean;
    };
    onFileSelected?: (
        imageKey: keyof typeof imageFields,
        imageType: ImageType,
        imageSourceId: string,
        file: File,
        previewUrl: string,
        bucketName: string
    ) => void;
    onFileDelete?: (
        imageKey: keyof typeof imageFields,
        imageType: ImageType,
        imageSourceId: string,
        previewUrl: string,
        bucketName: string
    ) => void;
    filePreviews?: Partial<Record<ImageField, string | null>>;
    stagedForDeletion?: Partial<Record<ImageField, ImageStagedForDeletion>>;
}

const imageFields = {
    avatarPhoto: 'avatarPhoto',
    coverPhoto: 'coverPhoto'
} as const;

const UploadIndicator: FC<{ isUploading?: boolean }> = ({ isUploading }) => (
    <div className={`flex items-center justify-center bg-gray-100 text-gray-900 p-1 rounded-full group-hover:bg-gray-200 transition duration-150 ease-in-out ${isUploading ? 'border-gray-600 animate-spin' : 'border-white'}`}>
        {!isUploading ? <CameraIcon className="h-4 w-4" /> : <ArrowPathIcon className="h-4 w-4" />}
    </div>
);

const DeleteButton: FC<{ onDelete: () => void; className?: string }> = ({ onDelete, className = '' }) => (
    <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
        }}
        className={`${className} absolute bg-red-100 text-red-900 p-1 rounded-full group-hover:bg-red-200 transition duration-150 ease-in-out border-white border-2 cursor-pointer`}
        title="Delete Image"
    >
        <TrashIcon className="h-4 w-4" />
    </button>
);

const ProfileHeader: FC<ProfileHeaderProps> = ({
    source,
    coverPhotoType,
    avatarPhotoType,
    displayName,
    displaySubName,
    isUploading,
    onFileSelected,
    onFileDelete,
    filePreviews,
    stagedForDeletion
}) => {
    const [_isLoading, setIsLoading] = useState({ coverPhoto: false, avatar: false });
    const { imageUrls, renderImage } = useProfileImages(source, filePreviews);
    const sourceUserId = source?.userId || '';

    const avatarPhotoDeleted = stagedForDeletion?.avatarPhoto ? true : false;
    const coverPhotoDeleted = stagedForDeletion?.coverPhoto ? true : false;
    const avatarPhotoUrl =
        filePreviews?.avatarPhoto ??
        (avatarPhotoDeleted ? null : imageUrls.avatarPhoto ?? source?.avatarPhoto ?? null);

    const coverPhotoUrl =
        filePreviews?.coverPhoto ??
        (coverPhotoDeleted ? null : imageUrls.coverPhoto ?? source?.coverPhoto ?? null);

    return (
        <div className="flex flex-col">
            <div className="relative h-48 overflow-hidden group">
                {renderImage(
                    coverPhotoUrl,
                    'coverPhoto',
                    'absolute inset-0 w-full h-full object-cover',
                    () => setIsLoading((prev) => ({ ...prev, coverPhoto: false })),
                )}

                {onFileDelete && (coverPhotoUrl) && (
                    <DeleteButton
                        className="top-0 right-0 mt-4 mr-4"
                        onDelete={() =>
                            onFileDelete(
                                'coverPhoto',
                                coverPhotoType,
                                sourceUserId,
                                coverPhotoUrl,
                                ImageTypes[coverPhotoType].bucketName
                            )
                        }
                    />
                )}

                {onFileSelected && (
                    <label className="absolute bottom-0 right-0 mb-4 mr-4 rounded-full border-white border-2 cursor-pointer">
                        <UploadIndicator isUploading={isUploading?.coverPhoto} />
                        <ImageUpload
                            imageKey="coverPhoto"
                            imageType={coverPhotoType}
                            imageSourceId={sourceUserId}
                            bucketName={ImageTypes[coverPhotoType].bucketName}
                            handleFileStaged={onFileSelected}
                            onInputChange={(e) => e.stopPropagation()}
                        />
                    </label>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start max-w-5xl w-full mx-auto sm:px-8 px-4 py-4">
                <div className="shrink-0 sm:translate-y-[-50%]">
                    <label className="relative group">
                        <div className="relative">
                            {renderImage(
                                avatarPhotoUrl,
                                'avatarPhoto',
                                'h-32 w-32 rounded-full ring-4 ring-white',
                                () => setIsLoading((prev) => ({ ...prev, avatar: false }))
                            )}

                            {onFileDelete && (avatarPhotoUrl) && (
                                <DeleteButton
                                    className="bottom-0 left-0"
                                    onDelete={() =>
                                        onFileDelete(
                                            'avatarPhoto',
                                            avatarPhotoType,
                                            sourceUserId,
                                            avatarPhotoUrl,
                                            ImageTypes[avatarPhotoType].bucketName
                                        )
                                    }
                                />
                            )}

                            {onFileSelected && (
                                <label className="absolute bottom-0 right-0 rounded-full border-white border-2 cursor-pointer">
                                    <UploadIndicator isUploading={isUploading?.avatar} />
                                    <ImageUpload
                                        imageKey="avatarPhoto"
                                        imageType={avatarPhotoType}
                                        imageSourceId={sourceUserId}
                                        bucketName={ImageTypes[avatarPhotoType].bucketName}
                                        handleFileStaged={onFileSelected}
                                        onInputChange={(e) => e.stopPropagation()}
                                    />
                                </label>
                            )}
                        </div>
                    </label>
                </div>

                <div className="flex flex-col sm:ml-8 mt-4 sm:mt-0 w-full">
                    {displayName && <div className="text-2xl font-bold text-center sm:text-left">{displayName}</div>}
                    {displaySubName && <p className="text-md text-gray-500 text-center sm:text-left break-words">{displaySubName}</p>}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
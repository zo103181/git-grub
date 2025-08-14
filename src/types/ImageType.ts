import { ResponseUser } from "./User";

export const ImageTypes = {
    UserAvatarPhoto: {
        key: 'userAvatarPhoto',
        bucketName: 'avatar-photos',
        storageFolder: 'users',
        cacheLimit: 5
    },
    UserCoverPhoto: {
        key: 'userCoverPhoto',
        bucketName: 'cover-photos',
        storageFolder: 'users',
        cacheLimit: 5
    }
} as const;

export type ImageType = keyof typeof ImageTypes;
export type ImageField = 'avatarPhoto' | 'coverPhoto';

export interface ImageStagedForDeletion {
    imageKey: ImageField,
    imageType: ImageType,
    imageSourceId: string,
    previewUrl: string,
    bucketName: string
}

export type SharedImageSource = ResponseUser | null | undefined;

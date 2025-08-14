import {
    useRef,
    useCallback,
    ChangeEvent,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { ImageField, ImageType } from '../../types/ImageType';
import { useNotification } from '../../hooks/useNotification';
import { formatFileSize } from '../../lib/utils/formatFileSize';

export type ImageUploadHandle = {
    clear: () => void;
};

interface ImageUploadProps {
    imageKey: ImageField;
    imageType: ImageType;
    imageSourceId: string;
    bucketName: string;
    handleFileStaged: (
        imageKey: ImageField,
        imageType: ImageType,
        imageSourceId: string,
        file: File,
        previewUrl: string,
        bucketName: string
    ) => void;
    onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    maxSizeBytes?: number; // optional override
}

const DEFAULT_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>((
    {
        imageKey,
        imageType,
        imageSourceId,
        bucketName,
        handleFileStaged,
        onInputChange,
        accept,
        maxSizeBytes = DEFAULT_MAX_FILE_SIZE,
    },
    ref
) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { showNotification } = useNotification();

    useImperativeHandle(ref, () => ({
        clear: () => {
            if (inputRef.current) inputRef.current.value = '';
        },
    }), []);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.has(file.type)) {
            showNotification({
                type: 'error',
                message: 'Invalid file type',
                description: 'Only JPG, PNG, GIF are allowed.',
            });
            e.target.value = '';
            return;
        }

        if (file.size > maxSizeBytes) {
            showNotification({
                type: 'error',
                message: 'File too large',
                description: `Selected: ${formatFileSize(file.size)} (max ${formatFileSize(maxSizeBytes)})`,
            });
            e.target.value = '';
            return;
        }

        // local preview right away
        const previewUrl = URL.createObjectURL(file);

        // hand off to parent to stage + trigger upload
        handleFileStaged(imageKey, imageType, imageSourceId, file, previewUrl, bucketName);

        // let parent optionally listen to input changes
        onInputChange?.(e);

        // important: clear so user can pick the same file again
        e.target.value = '';
    }, [handleFileStaged, imageKey, imageType, imageSourceId, bucketName, maxSizeBytes, showNotification, onInputChange]);

    return (
        <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept || 'image/*'}
            onClick={(e) => {
                // ensure same-file reselect works across browsers
                (e.target as HTMLInputElement).value = '';
            }}
            onChange={handleFileChange}
        />
    );
});

ImageUpload.displayName = 'ImageUpload';
export default ImageUpload;

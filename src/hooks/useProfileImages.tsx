import { useState, useEffect, useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { fetchAndCacheImage } from '../lib/cache/fetchAndCacheImage';
import { getCachedImageRecord, toObjectUrl } from '../lib/cache/applicationCache';
import { ImageField, ImageType, SharedImageSource } from '@/types/ImageType';
import { isSupabaseUrl } from '@/lib/supabase';

export const useProfileImages = (
    source?: SharedImageSource,
    filePreviews?: Partial<Record<ImageField, string | null>>
) => {
    const [imageUrls, setImageUrls] = useState<Record<ImageField, string | null>>({
        avatarPhoto: source?.avatarPhoto ?? null,
        coverPhoto: source?.coverPhoto ?? null,
    });

    const [imageError, setImageError] = useState<Record<ImageField, boolean>>({
        avatarPhoto: false,
        coverPhoto: false,
    });

    // Track current object URLs to revoke when replaced/unmounted
    const objectUrlRef = useRef<Record<ImageField, string | null>>({
        avatarPhoto: null,
        coverPhoto: null,
    });

    useEffect(() => {
        const revoke = (field: ImageField) => {
            const prev = objectUrlRef.current[field];
            if (prev) {
                URL.revokeObjectURL(prev);
                objectUrlRef.current[field] = null;
            }
        };

        const load = async () => {
            if (!source?.userId) {
                revoke('avatarPhoto'); revoke('coverPhoto');
                setImageUrls({ avatarPhoto: null, coverPhoto: null });
                return;
            }

            const fields: ImageField[] = ['avatarPhoto', 'coverPhoto'];

            for (const field of fields) {
                const hasPreview = Boolean(filePreviews?.[field]);
                const imageUrl = source[field];
                if (hasPreview) continue;

                if (!imageUrl) {
                    revoke(field);
                    setImageUrls(p => ({ ...p, [field]: null }));
                    continue;
                }

                // External (e.g., Google) → don't fetch/cache; just use the URL
                if (!isSupabaseUrl(imageUrl)) {
                    revoke(field);
                    setImageUrls(p => ({ ...p, [field]: imageUrl }));
                    continue;
                }

                // Supabase URL → use cache + fetch if needed
                const imageType: ImageType = field === 'avatarPhoto' ? 'UserAvatarPhoto' : 'UserCoverPhoto';
                const cacheKey = `${imageType}-${source.userId}`;

                const rec = await getCachedImageRecord(cacheKey);
                if (rec && rec.originalUrl === imageUrl && (rec.blob || rec.dataUrl)) {
                    const objUrl = toObjectUrl(rec);
                    revoke(field);
                    objectUrlRef.current[field] = objUrl;
                    setImageUrls(p => ({ ...p, [field]: objUrl }));
                    continue;
                }

                await fetchAndCacheImage(imageUrl, imageType, source.userId, field, (updater) => {
                    revoke(field);
                    setImageUrls(updater);
                    // we can't read the value synchronously; leave tracking to the render
                }, handleError);
            }
        };

        load();

        return () => {
            URL.revokeObjectURL(objectUrlRef.current.avatarPhoto || '');
            URL.revokeObjectURL(objectUrlRef.current.coverPhoto || '');
            objectUrlRef.current.avatarPhoto = null;
            objectUrlRef.current.coverPhoto = null;
        };
    }, [
        source?.userId,
        source?.avatarPhoto,   // includes ?v=... so hook refreshes after uploads
        source?.coverPhoto,
        filePreviews?.avatarPhoto,
        filePreviews?.coverPhoto,
    ]);

    const handleError = (field: ImageField) => {
        const prev = objectUrlRef.current[field];
        if (prev) {
            URL.revokeObjectURL(prev);
            objectUrlRef.current[field] = null;
        }
        setImageError(p => ({ ...p, [field]: true }));
        setImageUrls(p => ({ ...p, [field]: null }));
    };

    const getInitials = (s?: SharedImageSource) => {
        if (!s?.displayName) return <PhotoIcon className="h-4 w-4 text-xs" />;
        return s.displayName.split(' ').map(n => n[0]?.toUpperCase()).join('');
    };

    const renderImage = (imageUrl: string | null | undefined, field: ImageField, customStyle = '', onError?: () => void) => {
        if (imageError[field] || !imageUrl) {
            return field === 'avatarPhoto'
                ? <span className={`flex items-center justify-center bg-gray-300 text-gray-500 text-2xl font-bold ${customStyle} rounded-full`}>{getInitials(source)}</span>
                : <div className="bg-gradient-to-bl from-blue-500 to-gray-500 h-48" />;
        }
        return (
            <img
                src={imageUrl}
                alt={field === 'avatarPhoto' ? 'Avatar Photo' : 'Cover Photo'}
                className={`object-cover ${customStyle}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => { handleError(field); onError?.(); }}
            />
        );
    };

    return { imageUrls, renderImage, getInitials };
};
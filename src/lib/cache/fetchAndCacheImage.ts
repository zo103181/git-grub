import { ImageType } from "@/types/ImageType";
import { Dispatch, SetStateAction } from "react";
import { cacheImage } from "./applicationCache";

type ImageField = 'avatarPhoto' | 'coverPhoto';

// Single-flight map to avoid duplicate fetches for the same key
const inFlight = new Map<string, Promise<string | null>>();

export const fetchAndCacheImage = async (
    imageUrl: string,
    imageType: ImageType,
    uid: string,
    field: ImageField,
    setImageUrls: Dispatch<SetStateAction<Record<ImageField, string | null>>>,
    handleError: (field: ImageField) => void
): Promise<string | null> => {
    const key = `${imageType}-${uid}`;
    if (inFlight.has(key)) return inFlight.get(key)!;

    const p = (async () => {
        try {
            const res = await fetch(imageUrl, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Failed to fetch image from ${imageUrl} (${res.status})`);

            const blob = await res.blob();

            await cacheImage(imageType, uid, blob, imageUrl);
            const objUrl = URL.createObjectURL(blob);

            setImageUrls(prev => ({ ...prev, [field]: objUrl }));
            return objUrl;
        } catch (e) {
            console.error('Image fetch/cache error:', e);
            handleError(field);
            return null;
        } finally {
            inFlight.delete(key);
        }
    })();

    inFlight.set(key, p);
    return p;
};

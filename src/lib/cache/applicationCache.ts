import { openDB } from 'idb';
import { ImageType, ImageTypes } from '@/types/ImageType';

const DB_NAME = 'viteReactStarterCacheDB';
const STORES = { IMAGES: 'images' };

export type ImageRecord = {
    url: string;                 // key: `${imageType}-${imageSourceId}`
    originalUrl: string;         // full public URL (incl. ?v=...)
    imageSourceId: string;       // userId
    imageType: ImageType;
    blob?: Blob;                 // preferred
    dataUrl?: string;            // backward compat (old entries)
    timestamp: number;           // Date.now()
};

const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORES.IMAGES)) {
                const store = db.createObjectStore(STORES.IMAGES, { keyPath: 'url' });
                store.createIndex('bySourceId', 'imageSourceId', { unique: false });
                store.createIndex('byType', 'imageType', { unique: false });
                store.createIndex('byTimestamp', 'timestamp', { unique: false });
            }
        },
    });
};

const putInStore = async (data: ImageRecord) => {
    const db = await initDB();
    await db.put(STORES.IMAGES, { ...data, timestamp: Date.now() });
};

const getFromStore = async (key: IDBValidKey) => {
    const db = await initDB();
    return db.get(STORES.IMAGES, key) as Promise<ImageRecord | undefined>;
};

const deleteFromStore = async (key: IDBValidKey) => {
    const db = await initDB();
    return db.delete(STORES.IMAGES, key);
};

export const cacheImage = async (imageType: ImageType, imageSourceId: string, fileOrBlob: File | Blob, originalUrl: string) => {
    const blob = fileOrBlob; // File is a Blob
    const url = `${imageType}-${imageSourceId}`;
    await deleteFromStore(url);
    await putInStore({ url, originalUrl, imageSourceId, imageType, blob, timestamp: Date.now() });
    await enforceImageTypeLimit(imageType);
};

export const getCachedImage = async (key: IDBValidKey) => {
    const rec = await getFromStore(key);
    if (!rec) return null;
    if (rec.blob) return URL.createObjectURL(rec.blob);
    if (rec.dataUrl) return rec.dataUrl as unknown as string; // old entries
    return null;
};

export const getCachedImageRecord = async (key: IDBValidKey) => getFromStore(key);

export const toObjectUrl = (rec?: ImageRecord | null) =>
    rec?.blob ? URL.createObjectURL(rec.blob) : rec?.dataUrl ?? null;

export const deleteCachedImage = (imageType: ImageType, imageSourceId: string) =>
    deleteFromStore(`${imageType}-${imageSourceId}`);

export const deleteCachedImagesBySourceId = async (imageSourceId: string) => {
    const db = await initDB();
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const idx = store.index('bySourceId');
    const keys = await idx.getAllKeys(imageSourceId);
    for (const key of keys) await store.delete(key as IDBValidKey);
    await tx.done;
};

export const deleteAllCachedImages = async () => {
    const db = await initDB();
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    await tx.objectStore(STORES.IMAGES).clear();
    await tx.done;
};

const enforceImageTypeLimit = async (imageType: ImageType) => {
    const db = await initDB();
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const byType = store.index('byType');

    const allOfType = await byType.getAll(imageType) as ImageRecord[];
    const limit = ImageTypes[imageType].cacheLimit;

    if (allOfType.length > limit) {
        allOfType.sort((a, b) => a.timestamp - b.timestamp); // oldest first
        const toDelete = allOfType.slice(0, allOfType.length - limit);
        for (const rec of toDelete) await store.delete(rec.url);
    }

    await tx.done;
};

export const deleteCacheDatabase = async () => {
    await indexedDB.deleteDatabase(DB_NAME);
};

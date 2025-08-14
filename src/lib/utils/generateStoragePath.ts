import { ImageType, ImageTypes } from "../../types/ImageType";

export function generateStoragePath(imageType: ImageType, imageSourceId: string, userId: string, fileName: string): string {
  const folder = ImageTypes[imageType].storageFolder;
  const extension = fileName.split('.').pop();
  const fileNameRef = imageSourceId === userId
    ? `${userId}.${extension}`
    : `${imageSourceId}_${userId}.${extension}`;
  return `${folder}/${fileNameRef}`;
}

import { SharedImageSource } from "../../types/ImageType";
import { ResponseUser } from "../../types/User";

export const isUser = (source: SharedImageSource): source is ResponseUser => {
    return !!source && 'displayName' in source;
};

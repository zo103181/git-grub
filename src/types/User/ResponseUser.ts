import { BaseUser } from "./BaseUser";
import { ResponseTimestamp } from "../Timestamp";

export interface ResponseUser extends BaseUser, ResponseTimestamp {
    userId: string;
}

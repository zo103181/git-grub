import { BaseUser } from "./BaseUser";

export interface RequestUser extends BaseUser {
    userId?: string;
}

import { PostgresTimestamp } from "../Timestamp";

export interface PostgresUser extends PostgresTimestamp {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
  avatar_photo: string | null;
  cover_photo: string | null;
}

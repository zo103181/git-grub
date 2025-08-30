import { BaseUser, PostgresUser, RequestUser, ResponseUser } from "@/types/User";

// Map PostgresUser (from DB) to ResponseUser (for client)
export const mapPostgresUserToResponseUser = (user: PostgresUser): ResponseUser => {
    return {
        userId: user.id,
        email: user.email,
        displayName: user.display_name ?? "",
        username: user.username ?? "",
        avatarPhoto: user.avatar_photo,
        coverPhoto: user.cover_photo,
        createdAt: user.created_at,
        updatedOn: user.updated_on,
    };
};

// Map RequestUser (from client) to BaseUser (for updates or inserts)
export const mapRequestUserToBaseUser = (user: RequestUser): BaseUser => {
    return {
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarPhoto: user.avatarPhoto,
        coverPhoto: user.coverPhoto,
    };
};

// Map BaseUser (from client) to PostgresUser (for updates or inserts)
export const mapBaseUserToPostgresUser = (user: BaseUser): Partial<PostgresUser> => {
    return {
        email: user.email,
        display_name: user.displayName,
        username: user.username,
        avatar_photo: user.avatarPhoto ?? null,
        cover_photo: user.coverPhoto ?? null
    }
}

// Optional: Map ResponseUser back to PostgresUser (may be used for testing or mock data)
export const mapResponseUserToPostgresUser = (user: ResponseUser): PostgresUser => {
    return {
        id: user.userId,
        email: user.email,
        display_name: user.displayName,
        username: user.username,
        avatar_photo: user.avatarPhoto,
        cover_photo: user.coverPhoto,
        created_at: user.createdAt,
        updated_on: user.updatedOn,
    };
};

export type AuthUser = {
    login: string;
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
};
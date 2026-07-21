export type Role = "ADMIN" | "COACH";

export const ROLES: Role[] = ["ADMIN", "COACH"];

/** Ein User, wie ihn das Backend ausliefert (UserResponseDto). */
export type User = {
    id: string;
    name: string;
    nickname: string;
    role: Role;
    githubName: string;
    email: string;
    avatarUrl?: string;
};

/** Die Felder, die zum Anlegen/Bearbeiten ans Backend gehen (UserRequestDto). */
export type UserInput = Omit<User, "id">;

/** Loest die id aus einem User heraus -> nur die editierbaren Felder. */
export function toUserInput(user: User): UserInput {
    const {name, nickname, role, githubName, email, avatarUrl} = user;
    return {name, nickname, role, githubName, email, avatarUrl};
}

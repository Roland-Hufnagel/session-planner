export type Role = "ADMIN" | "COACH";

export const ROLES: Role[] = ["ADMIN", "COACH"];

export type User = {
    id: string;
    name: string;
    nickname: string;
    role: Role;
    githubName: string;
    email: string;
    avatarUrl?: string;
    active: boolean;
};

//Die Felder, die zum Anlegen/Bearbeiten ans Backend gehen (UserRequestDto).
export type UserInput = Omit<User, "id">;

//Loest die id aus einem User heraus -> nur die editierbaren Felder.
export function toUserInput(user: User): UserInput {
    const {name, nickname, role, githubName, email, avatarUrl, active} = user;
    return {name, nickname, role, githubName, email, avatarUrl, active};
}

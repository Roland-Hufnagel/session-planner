import useSWR from "swr";
import {createUser, deleteUser, fetcher, updateUser, USERS_KEY} from "../api/users";
import type {User, UserInput} from "../types/user";

/**
 * Zentraler Hook fuer die User-Liste.
 *
 * Liest die Liste via SWR (mit automatischer Revalidierung) und stellt
 * Mutationen mit Optimistic UI bereit: Die UI aktualisiert sich sofort,
 * und bei einem Fehler rollt SWR den Cache automatisch zurueck
 * (rollbackOnError).
 */
export function useUsers() {
    const {data, error, isLoading, mutate} = useSWR<User[]>(USERS_KEY, fetcher);

    const users = data ?? [];

    async function addUser(input: UserInput): Promise<User> {
        // Platzhalter-Eintrag, der sofort in der Liste erscheint.
        const optimisticUser: User = {...input, id: `temp-${crypto.randomUUID()}`};
        let createdUser: User;

        await mutate(
            async (currentUsers = []) => {
                createdUser = await createUser(input);
                return [...currentUsers, createdUser];
            },
            {
                optimisticData: (currentUsers = []) => [...currentUsers, optimisticUser],
                rollbackOnError: true,
                revalidate: false,
            },
        );

        return createdUser!;
    }

    async function editUser(id: string, input: UserInput): Promise<User> {
        let updatedUser: User;

        await mutate(
            async (currentUsers = []) => {
                updatedUser = await updateUser(id, input);
                return currentUsers.map((user) => (user.id === id ? updatedUser : user));
            },
            {
                optimisticData: (currentUsers = []) =>
                    currentUsers.map((user) => (user.id === id ? {...user, ...input} : user)),
                rollbackOnError: true,
                revalidate: false,
            },
        );

        return updatedUser!;
    }

    async function removeUser(id: string): Promise<void> {
        await mutate(
            async (currentUsers = []) => {
                await deleteUser(id);
                return currentUsers.filter((user) => user.id !== id);
            },
            {
                optimisticData: (currentUsers = []) => currentUsers.filter((user) => user.id !== id),
                rollbackOnError: true,
                revalidate: false,
            },
        );
    }

    return {users, error, isLoading, addUser, editUser, removeUser};
}

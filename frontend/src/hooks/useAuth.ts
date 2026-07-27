import useSWR, {mutate} from "swr";
import {AUTH_ME_ENDPOINT, authFetcher, logout as logoutRequest} from "../api/auth";

/** Aktueller Login-Status via /api/auth/me. user === null ⇒ ausgeloggt. */
export function useAuth() {
    const {data, isLoading} = useSWR(AUTH_ME_ENDPOINT, authFetcher);

    async function logout() {
        await logoutRequest();
        await mutate(AUTH_ME_ENDPOINT, null, false);
    }

    return {user: data ?? null, isLoading, logout};
}
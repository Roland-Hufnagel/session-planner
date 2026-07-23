import useSWR from "swr";
import {AUTH_ME_ENDPOINT, authFetcher} from "../api/auth";

/** Aktueller Login-Status via /api/auth/me. user === null ⇒ ausgeloggt. */
export function useAuth() {
    const {data, isLoading} = useSWR(AUTH_ME_ENDPOINT, authFetcher);
    return {user: data ?? null, isLoading};
}
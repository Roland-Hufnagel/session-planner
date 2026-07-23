import {api} from "./client";
import type {AuthUser} from "../types/auth";

export const AUTH_ME_ENDPOINT = "/api/auth/me";

/** GET /api/auth/me → Attribute oder null (leerer Body = ausgeloggt). */
export const authFetcher = (url: string): Promise<AuthUser | null> =>
    api.get(url).then((res) => res.data || null);
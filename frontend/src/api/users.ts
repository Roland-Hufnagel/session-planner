import { api } from "./client";
import type { User, UserInput } from "../types/user";

export const USERS_ENDPOINT = "/api/users";

/** Generischer SWR-Fetcher (GET → data). */
export const fetcher = <T>(url: string): Promise<T> =>
  api.get<T>(url).then((res) => res.data);

export const createUser = (input: UserInput): Promise<User> =>
  api.post<User>(USERS_ENDPOINT, input).then((res) => res.data);

export const updateUser = (id: string, input: UserInput): Promise<User> =>
  api.put<User>(`${USERS_ENDPOINT}/${id}`, input).then((res) => res.data);

export const deleteUser = (id: string): Promise<void> =>
  api.delete(`${USERS_ENDPOINT}/${id}`).then(() => undefined);

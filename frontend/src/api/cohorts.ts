import { api } from "./client";
import type { Cohort, CohortInput } from "../types/cohort";

export const COHORTS_ENDPOINT = "/api/cohorts";

export const createCohort = (input: CohortInput): Promise<Cohort> =>
  api.post<Cohort>(COHORTS_ENDPOINT, input).then((res) => res.data);

export const updateCohort = (id: string, input: CohortInput): Promise<Cohort> =>
  api.put<Cohort>(`${COHORTS_ENDPOINT}/${id}`, input).then((res) => res.data);

export const deleteCohort = (id: string): Promise<void> =>
  api.delete(`${COHORTS_ENDPOINT}/${id}`).then(() => undefined);

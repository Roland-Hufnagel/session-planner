import useSWR from "swr";
import {fetcher} from "../api/client";
import {COHORTS_ENDPOINT, createCohort, deleteCohort, updateCohort} from "../api/cohorts";
import type {Cohort, CohortInput} from "../types/cohort";

/**
 * Zentraler Hook fuer die Cohort-Liste.
 *
 * Liest die Liste via SWR (mit automatischer Revalidierung) und stellt
 * Mutationen mit Optimistic UI bereit: Die UI aktualisiert sich sofort,
 * und bei einem Fehler rollt SWR den Cache automatisch zurueck
 * (rollbackOnError).
 */
export function useCohorts() {
    const {data, error, isLoading, mutate} = useSWR<Cohort[]>(COHORTS_ENDPOINT, fetcher);

    const cohorts = data ?? [];

    async function addCohort(input: CohortInput): Promise<Cohort> {
        // Platzhalter-Eintrag, der sofort in der Liste erscheint.
        const optimisticCohort: Cohort = {...input, id: `temp-${crypto.randomUUID()}`};
        let createdCohort: Cohort;

        await mutate(
            async (currentCohorts = []) => {
                createdCohort = await createCohort(input);
                return [...currentCohorts, createdCohort];
            },
            {
                optimisticData: (currentCohorts = []) => [...currentCohorts, optimisticCohort],
                rollbackOnError: true,
                revalidate: false,
            },
        );

        return createdCohort!;
    }

    async function editCohort(id: string, input: CohortInput): Promise<Cohort> {
        let updatedCohort: Cohort;

        await mutate(
            async (currentCohorts = []) => {
                updatedCohort = await updateCohort(id, input);
                return currentCohorts.map((cohort) => (cohort.id === id ? updatedCohort : cohort));
            },
            {
                optimisticData: (currentCohorts = []) =>
                    currentCohorts.map((cohort) => (cohort.id === id ? {...cohort, ...input} : cohort)),
                rollbackOnError: true,
                revalidate: false,
            },
        );

        return updatedCohort!;
    }

    async function removeCohort(id: string): Promise<void> {
        await mutate(
            async (currentCohorts = []) => {
                await deleteCohort(id);
                return currentCohorts.filter((cohort) => cohort.id !== id);
            },
            {
                optimisticData: (currentCohorts = []) => currentCohorts.filter((cohort) => cohort.id !== id),
                rollbackOnError: true,
                revalidate: false,
            },
        );
    }

    return {cohorts, error, isLoading, addCohort, editCohort, removeCohort};
}

import useSWR from "swr";
import {fetcher} from "../api/client";
import {assignCoach, weekShiftsUrl} from "../api/shifts";
import type {Shift} from "../types/shift";
import type {User} from "../types/user";

/**
 * Shifts eines Zeitraums – fuer die Wochenansicht.
 *
 * Bewusst getrennt von useShifts(cohortId): anderer SWR-Key, andere Mutation.
 * Hier gibt es nur das Zuweisen eines Coaches; Anlegen, Bearbeiten und Loeschen
 * bleiben in der Shift-Verwaltung.
 */
export function useWeekShifts(from: string, to: string) {
    const {data, error, isLoading, mutate} = useSWR<Shift[]>(weekShiftsUrl(from, to), fetcher);

    const shifts = data ?? [];

    async function assignShiftCoach(shiftId: string, coach: User | null): Promise<void> {
        const withCoach = (currentShifts: Shift[]) =>
            currentShifts.map((shift) => (shift.id === shiftId ? {...shift, coach} : shift));

        await mutate(
            async (currentShifts = []) => {
                const updatedShift = await assignCoach(shiftId, coach?.id ?? null);
                return currentShifts.map((shift) => (shift.id === shiftId ? updatedShift : shift));
            },
            {
                optimisticData: (currentShifts = []) => withCoach(currentShifts),
                rollbackOnError: true,
                revalidate: false,
            },
        );
    }

    return {shifts, error, isLoading, assignShiftCoach};
}

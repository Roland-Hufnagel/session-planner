import useSWR from "swr";
import {fetcher} from "../api/client";
import {assignCoach, deleteShift, updateShift, weekShiftsUrl} from "../api/shifts";
import type {Shift, ShiftInput} from "../types/shift";
import type {User} from "../types/user";

/**
 * Shifts eines Zeitraums – fuer die Wochenansicht.
 *
 * Bewusst getrennt von useShifts(cohortId): anderer SWR-Key, andere Mutation.
 * Hier gibt es das Zuweisen eines Coaches sowie Schnellkorrektur und Loeschen
 * einer Shift; das Anlegen bleibt in der Shift-Verwaltung.
 */
export function useWeekShifts(from: string, to: string) {
    const {data, error, isLoading, mutate} = useSWR<Shift[]>(
        weekShiftsUrl(from, to),
        fetcher,
        {refreshInterval: 5000},
    );

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

    /**
     * Schnellkorrektur einer Shift aus der Wochenansicht.
     *
     * Anders als beim Zuweisen wird hier revalidiert: Eine Datumsaenderung kann
     * die Shift aus der geladenen Woche heraus verschieben, und dann ist die
     * Liste vom Server die einzige verlaessliche Quelle. Ohne das bliebe sie mit
     * fremdem Datum im Array stehen und wuerde z.B. weiter eine Coach-Zeile
     * offen halten.
     */
    async function editShift(shiftId: string, input: ShiftInput): Promise<void> {
        await mutate(
            async (currentShifts = []) => {
                const updatedShift = await updateShift(shiftId, input);
                return currentShifts.map((shift) => (shift.id === shiftId ? updatedShift : shift));
            },
            {rollbackOnError: true, revalidate: true},
        );
    }

    /**
     * Loescht eine Shift aus der Wochenansicht.
     *
     * Bewusst OHNE optimisticData, anders als beim Zuweisen: Die Karte traegt das
     * Formular, aus dem geloescht wird. Wuerde sie sofort verschwinden, waere das
     * Popover samt Fehlermeldung mit ihr weg – ein fehlgeschlagenes Loeschen
     * bliebe unsichtbar. So wartet die Karte auf die Bestaetigung des Servers.
     */
    async function removeShift(shiftId: string): Promise<void> {
        await mutate(
            async (currentShifts = []) => {
                await deleteShift(shiftId);
                return currentShifts.filter((shift) => shift.id !== shiftId);
            },
            {rollbackOnError: true, revalidate: false},
        );
    }

    return {shifts, error, isLoading, assignShiftCoach, editShift, removeShift};
}

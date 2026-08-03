import type {Cohort} from "./cohort";
import type {User} from "./user";

/**
 * Eine Shift, wie sie das Backend ausliefert (ShiftResponseDto).
 *
 * coach und cohort kommen als verschachtelte DTOs mit – das Backend laedt sie
 * per @EntityGraph im selben Query. coach ist null, wenn die Shift unbesetzt ist.
 * date/startTime/endTime sind ISO-Strings ("2026-08-05", "09:00:00").
 */
export type Shift = {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    coach: User | null;
    cohort: Cohort;
};

/**
 * Die Felder, die zum Anlegen/Bearbeiten ans Backend gehen (ShiftRequestDto).
 *
 * Anders als in der Response stehen hier nur die IDs: Der Client sagt, WELCHER
 * Coach und WELCHE Cohorte gemeint sind – die Objekte holt der Server selbst.
 * coachId ist null bei einer unbesetzten Shift.
 */
export type ShiftInput = {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    coachId: string | null;
    cohortId: string;
};

/** Loest die Response-Form in die editierbaren Felder auf. */
export function toShiftInput(shift: Shift): ShiftInput {
    return {
        title: shift.title,
        date: shift.date,
        // <input type="time"> arbeitet mit "09:00", das Backend liefert "09:00:00"
        startTime: shift.startTime.slice(0, 5),
        endTime: shift.endTime.slice(0, 5),
        coachId: shift.coach?.id ?? null,
        cohortId: shift.cohort.id,
    };
}

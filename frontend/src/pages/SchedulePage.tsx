import {useState} from "react";
import {useWeekShifts} from "../hooks/useWeekShifts";
import {useUsers} from "../hooks/useUsers";
import {useAuth} from "../hooks/useAuth";
import {getErrorMessage} from "../api/errors";
import type {Shift} from "../types/shift";
import type {User} from "../types/user";
import {addWeeks, mondayOf, sundayOf, weekDaysOf} from "../utils/week";
import {WeekPicker} from "../components/schedule/WeekPicker";
import {ScheduleGrid} from "../components/schedule/ScheduleGrid";
import {Toolbar, Title, Info, ErrorBox, Empty} from "../components/ui/PageState.ts";

/**
 * Wochenplan: Tage als Spalten, "Unassigned" und je ein Coach als Zeilen.
 *
 * Die angezeigten Tage sind Mo–Fr plus die Wochenendtage, an denen Shifts
 * liegen – so bleibt das Raster schmal, ohne Shifts zu verstecken.
 */
export function SchedulePage() {
    const [monday, setMonday] = useState(() => mondayOf());
    const [justAssignedShiftId, setJustAssignedShiftId] = useState<string | null>(null);
    const [assignError, setAssignError] = useState<string | null>(null);

    const {shifts, error, isLoading, assignShiftCoach, editShift, removeShift} =
        useWeekShifts(monday, sundayOf(monday));
    const {users, error: usersError} = useUsers();
    const {user: me} = useAuth();

    const days = visibleDays(monday, shifts);
    const coaches = coachRows(users, shifts, me?.login);
    const myCoachId = coaches.find(coach => coach.githubName === me?.login)?.id ?? null;
    // Zuweisen darf man nur an aktive Coaches – ausgeschiedene haben zwar noch
    // eine Zeile (wegen alter Shifts), sollen aber keine neuen bekommen.
    const assignableCoaches = coaches.filter((coach) => coach.active);

    async function handleAssign(shiftId: string, coach: User | null) {
        setJustAssignedShiftId(shiftId);
        setAssignError(null);
        try {
            await assignShiftCoach(shiftId, coach);
        } catch (error) {
            setAssignError(getErrorMessage(error));
            // Sonst bliebe die Karte als "gerade zugewiesen" markiert, obwohl
            // die Zuweisung zurueckgerollt wurde.
            setJustAssignedShiftId(null);
        }
    }

    function handleArrived(shiftId: string) {
        setJustAssignedShiftId((current) => (current === shiftId ? null : current));
    }

    return (
        <>
            <Toolbar>
                <Title>Schedule</Title>
            </Toolbar>

            <WeekPicker
                monday={monday}
                onPreviousWeek={() => setMonday(addWeeks(monday, -1))}
                onNextWeek={() => setMonday(addWeeks(monday, 1))}
                onToday={() => setMonday(mondayOf())}
                isCurrentWeek={monday === mondayOf()}
            />

            {(error || usersError) && (
                <ErrorBox role="alert">
                    Could not load the schedule: {getErrorMessage(error ?? usersError)}
                </ErrorBox>
            )}

            {assignError && (
                <ErrorBox role="alert">
                    Could not assign the coach: {assignError}
                </ErrorBox>
            )}

            {isLoading && !error && <Info>Loading shifts…</Info>}

            {/* Ohne Coaches gibt es kein Raster – das ist ein anderer Zustand
                als "diese Woche keine Shifts" (dann steht das Raster leer da). */}
            {!isLoading && !error && !usersError && coaches.length === 0 && (
                <Empty>
                    <p>No coaches yet. Add users first to plan shifts.</p>
                </Empty>
            )}

            {!isLoading && !error && !usersError && coaches.length > 0 && (
                <ScheduleGrid
                    days={days}
                    coaches={coaches}
                    shifts={shifts}
                    assignableCoaches={assignableCoaches}
                    onAssign={handleAssign}
                    onEdit={editShift}
                    onDelete={removeShift}
                    justAssignedShiftId={justAssignedShiftId}
                    onArrived={handleArrived}
                    myCoachId={myCoachId}
                />
            )}
        </>
    );
}

/**
 * Mo–Fr immer, Sa und So nur wenn dort Shifts liegen – und dann nur der
 * betroffene Tag, nicht beide.
 */
function visibleDays(monday: string, shifts: Shift[]): string[] {
    const allDays = weekDaysOf(monday);
    const weekdays = allDays.slice(0, 5);
    const weekend = allDays.slice(5);
    return [
        ...weekdays,
        ...weekend.filter((day) => shifts.some((shift) => shift.date === day)),
    ];
}

/**
 * Wer eine Zeile bekommt: alle aktiven User – plus jeder inaktive Coach, der in
 * dieser Woche noch eine Shift hat.
 *
 * Die zweite Haelfte ist wichtig: Ohne sie haette ein ausgeschiedener Coach keine
 * Zeile, und seine Shifts wuerden nirgends im Raster erscheinen.
 *
 * Sortierung: eigene Zeile zuerst (erkannt ueber den GitHub-Login), dann
 * alphabetisch nach Nickname.
 */
function coachRows(users: User[], shifts: Shift[], myGithubName?: string): User[] {
    const rows = new Map<string, User>();

    users.filter((user) => user.active).forEach((user) => rows.set(user.id, user));
    shifts.forEach((shift) => {
        if (shift.coach) rows.set(shift.coach.id, shift.coach);
    });

    return [...rows.values()].sort((a, b) => {
        const aIsMe = Boolean(myGithubName) && a.githubName === myGithubName;
        const bIsMe = Boolean(myGithubName) && b.githubName === myGithubName;
        if (aIsMe !== bIsMe) return aIsMe ? -1 : 1;
        return a.nickname.localeCompare(b.nickname);
    });
}

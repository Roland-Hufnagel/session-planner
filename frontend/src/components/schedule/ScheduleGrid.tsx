import {Fragment} from "react";
import styled, {css} from "styled-components";
import dayjs from "dayjs";
import type {Shift} from "../../types/shift";
import type {User} from "../../types/user";
import {todayIso} from "../../utils/date";
import {UserAvatar} from "../users/UserAvatar";
import {InactiveBadge} from "../users/InactiveBadge";
import {ShiftCell} from "./ShiftCell";

type ScheduleGridProps = {
    days: string[];
    coaches: User[];
    shifts: Shift[];
    assignableCoaches: User[];
    onAssign: (shiftId: string, coach: User | null) => void;
    justAssignedShiftId: string | null;
    onArrived: (shiftId: string) => void;
};

/**
 * Wochenraster: Spalten sind Tage, Zeilen sind "Unassigned" plus je ein Coach.
 *
 * CSS Grid statt <table>, weil die Zeilenreihenfolge spaeter per Drag & Drop
 * aenderbar werden soll. Die Zellen liegen in DOM-Reihenfolge im Grid, die
 * Spaltenanzahl kommt aus der Tag-Liste.
 */
export function ScheduleGrid({
                                 days,
                                 coaches,
                                 shifts,
                                 assignableCoaches,
                                 onAssign,
                                 justAssignedShiftId,
                                 onArrived,
                             }: Readonly<ScheduleGridProps>) {
    const today = todayIso();

    /** Shifts einer Zelle, sortiert nach Startzeit, dann nach Cohort-Label. */
    function shiftsIn(day: string, coachId: string | null): Shift[] {
        return shifts
            .filter((shift) => shift.date === day && (shift.coach?.id ?? null) === coachId)
            .sort((a, b) => {
                const aLabel = a.cohort.nickname || a.cohort.name;
                const bLabel = b.cohort.nickname || b.cohort.name;
                return a.startTime.localeCompare(b.startTime) || aLabel.localeCompare(bLabel);
            });
    }

    return (
        <Scroll>
            <Grid $dayCount={days.length}>
                <CornerCell/>
                {days.map((day) => (
                    <DayHeader key={day} $isToday={day === today}>
                        <Weekday>{dayjs(day).format("ddd")}</Weekday>
                        <DayNumber>{dayjs(day).format("DD.MM.")}</DayNumber>
                    </DayHeader>
                ))}

                <RowLabel $highlight={false}>
                    <UnassignedMark aria-hidden="true">—</UnassignedMark>
                    <UnassignedLabel>Unassigned</UnassignedLabel>
                </RowLabel>
                {days.map((day) => (
                    <ShiftCell
                        key={day}
                        shifts={shiftsIn(day, null)}
                        isToday={day === today}
                        coaches={assignableCoaches}
                        onAssign={onAssign}
                        justAssignedShiftId={justAssignedShiftId}
                        onArrived={onArrived}
                    />
                ))}

                {coaches.map((coach, index) => (
                    <Fragment key={coach.id}>
                        <RowLabel $highlight={index === 0}>
                            <UserAvatar user={coach}/>
                            <CoachName>{coach.nickname}</CoachName>
                            {!coach.active && (
                                <BadgeSlot>
                                    <InactiveBadge/>
                                </BadgeSlot>
                            )}
                        </RowLabel>
                        {days.map((day) => (
                            <ShiftCell
                                key={day}
                                shifts={shiftsIn(day, coach.id)}
                                isToday={day === today}
                                coaches={assignableCoaches}
                                onAssign={onAssign}
                                justAssignedShiftId={justAssignedShiftId}
                                onArrived={onArrived}
                            />
                        ))}
                    </Fragment>
                ))}
            </Grid>
        </Scroll>
    );
}


const LABEL_MAX_WIDTH = "200px";
const MIN_DAY_WIDTH = "100px";
const MOBILE_BREAKPOINT = "640px";
const AVATAR_SIZE = "36px";

const hiddenOnMobile = css`
    @media (max-width: ${MOBILE_BREAKPOINT}) {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        border: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }
`;

const Scroll = styled.div`
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-1);
`;

const Grid = styled.div<{ $dayCount: number }>`
    display: grid;
    grid-template-columns: fit-content(${LABEL_MAX_WIDTH}) repeat(
            ${(props) => props.$dayCount},
            minmax(${MIN_DAY_WIDTH}, 1fr)
    );
    min-width: min-content;
`;

const CornerCell = styled.div`
    border-bottom: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
    background: var(--color-surface-2);
`;

const DayHeader = styled.div<{ $isToday: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-3) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    background: ${(props) =>
            props.$isToday ? "var(--color-primary-soft)" : "var(--color-surface-2)"};

    &:not(:last-child) {
        border-right: 1px solid var(--color-border);
    }
`;

const Weekday = styled.span`
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
`;

const DayNumber = styled.span`
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    font-variant-numeric: tabular-nums;
`;

const RowLabel = styled.div<{ $highlight: boolean }>`
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border-bottom: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
    ${(props) => (
            props.$highlight && "border-left: 5px solid var(--color-primary); border-top-left-radius: 5px; border-bottom-left-radius: 5px;")}
    background: var(--color-surface-2);
    position: sticky;
    left: 0;
    z-index: 1;
`;

const CoachName = styled.span`
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    ${hiddenOnMobile}
`;

const UnassignedLabel = styled.span`
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--color-text-secondary);
    white-space: nowrap;

    ${hiddenOnMobile}
`;

const UnassignedMark = styled.span`
    display: none;

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: grid;
        place-items: center;
        width: ${AVATAR_SIZE};
        height: ${AVATAR_SIZE};
        flex-shrink: 0;
        color: var(--color-text-muted);
    }
`;

const BadgeSlot = styled.span`
    display: inline-flex;

    ${hiddenOnMobile}
`;


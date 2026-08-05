import styled from "styled-components";
import type {Shift} from "../../types/shift";
import type {User} from "../../types/user";
import {ShiftCard} from "./ShiftCard";

type ShiftCellProps = {
    shifts: Shift[];
    isToday: boolean;
    coaches: User[];
    onAssign: (shiftId: string, coach: User | null) => void;
    justAssignedShiftId: string | null;
    onArrived: (shiftId: string) => void;
};

export function ShiftCell({
                              shifts,
                              isToday,
                              coaches,
                              onAssign,
                              justAssignedShiftId,
                              onArrived,
                          }: Readonly<ShiftCellProps>) {
    return (
        <Cell $isToday={isToday}>
            {shifts.map((shift) => (
                <ShiftCard
                    key={shift.id}
                    shift={shift}
                    coaches={coaches}
                    onAssign={(coach) => onAssign(shift.id, coach)}
                    arriving={shift.id === justAssignedShiftId}
                    onArrived={() => onArrived(shift.id)}
                />
            ))}
        </Cell>
    );
}

const Cell = styled.div<{ $isToday: boolean }>`
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2);
    min-height: 72px;
    border-bottom: 1px solid var(--color-border);
    background: ${(props) => (props.$isToday ? "var(--color-primary-soft)" : "transparent")};

    &:not(:last-child) {
        border-right: 1px solid var(--color-border);
    }
`;

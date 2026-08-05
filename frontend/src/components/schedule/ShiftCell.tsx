import styled from "styled-components";
import type {Shift, ShiftInput} from "../../types/shift";
import type {User} from "../../types/user";
import {ShiftCard} from "./ShiftCard";

type ShiftCellProps = {
    shifts: Shift[];
    isToday: boolean;
    coaches: User[];
    onAssign: (shiftId: string, coach: User | null) => void;
    onEdit: (shiftId: string, input: ShiftInput) => Promise<void>;
    onDelete: (shiftId: string) => Promise<void>;
    justAssignedShiftId: string | null;
    onArrived: (shiftId: string) => void;
};

export function ShiftCell({
                              shifts,
                              isToday,
                              coaches,
                              onAssign,
                              onEdit,
                              onDelete,
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
                    onEdit={(input) => onEdit(shift.id, input)}
                    onDelete={() => onDelete(shift.id)}
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

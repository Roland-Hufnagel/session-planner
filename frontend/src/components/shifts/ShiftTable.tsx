import styled from "styled-components";
import type {Shift} from "../../types/shift";
import {formatIsoDate, formatIsoTime} from "../../utils/date";
import {Scroll, Table, Th, Row, Td, Muted, Unassigned} from "../ui/Table.ts";

type ShiftTableProps = {
    shifts: Shift[];
    onEdit: (shift: Shift) => void;
    onDelete: (shift: Shift) => void;
};

export function ShiftTable({shifts, onEdit, onDelete}: Readonly<ShiftTableProps>) {
    return (
        <Scroll>
            <Table>
                <thead>
                <tr>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Title</Th>
                    <Th>Coach</Th>
                    <Th aria-label="Actions"/>
                </tr>
                </thead>
                <tbody>
                {shifts.map((shift) => (
                    <Row
                        key={shift.id}
                        onClick={() => onEdit(shift)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Edit ${shift.title} on ${formatIsoDate(shift.date)}`}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onEdit(shift);
                            }
                        }}
                    >
                        <Td>{formatIsoDate(shift.date)}</Td>
                        <Td>
                            <Muted>
                                {formatIsoTime(shift.startTime)} – {formatIsoTime(shift.endTime)}
                            </Muted>
                        </Td>
                        <Td>{shift.title}</Td>
                        <Td>
                            {shift.coach
                                ? shift.coach.nickname
                                : <Unassigned>Unassigned</Unassigned>}
                        </Td>
                        <ActionCell>
                            <DeleteButton
                                type="button"
                                aria-label={`Delete ${shift.title}`}
                                title="Delete"
                                // stopPropagation: sonst oeffnet der Klick zusaetzlich
                                // das Bearbeiten-Formular der Zeile.
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDelete(shift);
                                }}
                            >
                                <TrashIcon
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M3 6h18"/>
                                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
                                    <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/>
                                    <path d="M10 11v6M14 11v6"/>
                                </TrashIcon>
                            </DeleteButton>
                        </ActionCell>
                    </Row>
                ))}
                </tbody>
            </Table>
        </Scroll>
    );
}

const ActionCell = styled(Td)`
    width: 1%;
    text-align: right;
`;

const DeleteButton = styled.button`
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);

    &:hover {
        background: var(--color-danger-soft);
        color: var(--color-danger);
    }
`;

const TrashIcon = styled.svg`
    width: 18px;
    height: 18px;
`;

import type {ParsedShiftRow} from "../../types/shift";
import {formatIsoDate} from "../../utils/date";
import {Scroll, Table, Th, Td, Muted, Unassigned} from "../ui/Table.ts";

type ShiftPreviewTableProps = {
    rows: ParsedShiftRow[];
};


export function ShiftPreviewTable({rows}: Readonly<ShiftPreviewTableProps>) {
    return (
        <Scroll>
            <Table>
                <thead>
                <tr>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Title</Th>
                    <Th>Coach</Th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row) => (
                    <tr key={row.lineNumber}>
                        <Td>{formatIsoDate(row.date)}</Td>
                        <Td>
                            <Muted>
                                {row.startTime} – {row.endTime}
                            </Muted>
                        </Td>
                        <Td>{row.title}</Td>
                        <Td>
                            <Unassigned>Unassigned</Unassigned>
                        </Td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Scroll>
    );
}

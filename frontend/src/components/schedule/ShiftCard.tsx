import type {AnimationEvent} from "react";
import styled, {css, keyframes} from "styled-components";
import type {Shift, ShiftInput} from "../../types/shift";
import type {User} from "../../types/user";
import {formatIsoTime} from "../../utils/date";
import {CoachPicker} from "./CoachPicker";
import {ShiftEditor} from "./ShiftEditor";

type ShiftCardProps = {
    shift: Shift;
    coaches: User[];
    onAssign: (coach: User | null) => void;
    onEdit: (input: ShiftInput) => Promise<void>;
    onDelete: () => Promise<void>;
    arriving?: boolean;
    onArrived?: () => void;
};


export function ShiftCard({
                              shift,
                              coaches,
                              onAssign,
                              onEdit,
                              onDelete,
                              arriving = false,
                              onArrived,
                          }: Readonly<ShiftCardProps>) {

    function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
        if (event.target === event.currentTarget) onArrived?.();
    }

    return (
        <Card
            style={{background: shift.cohort.colorCode}}
            $arriving={arriving}
            onAnimationEnd={handleAnimationEnd}
        >
            <ShiftEditor shift={shift} onSubmit={onEdit} onDelete={onDelete}/>
            <Header>
                <Time>
                    {formatIsoTime(shift.startTime)}–{formatIsoTime(shift.endTime)}
                </Time>
                <CoachPicker
                    shiftId={shift.id}
                    currentCoachId={shift.coach?.id ?? null}
                    coaches={coaches}
                    onAssign={onAssign}
                />
            </Header>
            <CohortLabel>{shift.cohort.nickname || shift.cohort.name}</CohortLabel>
            <Title>{shift.title}</Title>
        </Card>
    );
}

const arrive = keyframes`
    from {
        transform: translateY(-6px) scale(0.97);
        opacity: 0.5;
    }
    to {
        transform: none;
        opacity: 1;
    }
`;

const Card = styled.div<{ $arriving: boolean }>`
    display: flex;
    flex-direction: column;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    color: #ffffff;
    box-shadow: var(--shadow-1);
    overflow: hidden;
    line-height: 1.3;
    /* Bezug fuer das Klick-Overlay in ShiftEditor. */
    position: relative;
    isolation: isolate;

    /* Die ganze Karte ist klickbar – das braucht eine Rueckmeldung, sonst sieht
       sie aus wie reine Anzeige. Nur der Schatten, keine Farbaenderung: Die
       Flaeche traegt die Cohort-Farbe, an der soll nichts wackeln. */
    transition: box-shadow var(--transition-fast);

    &:hover {
        box-shadow: var(--shadow-2);
    }

    ${(props) =>
            props.$arriving &&
            css`
                animation: ${arrive} 220ms ease-out;
            `}
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-1);
    justify-content: space-between;
`;

const Time = styled.span`
    font-size: var(--text-2xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.02em;
    opacity: 0.9;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const CohortLabel = styled.span`
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Title = styled.span`
    font-size: var(--text-2xs);
    opacity: 0.85;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

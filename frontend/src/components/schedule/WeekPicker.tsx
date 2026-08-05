import styled from "styled-components";
import {weekLabel} from "../../utils/week";
import {Button} from "../ui/Button";

type WeekPickerProps = {
    monday: string;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    isCurrentWeek: boolean;
};

export function WeekPicker({
                               monday,
                               onPreviousWeek,
                               onNextWeek,
                               onToday,
                               isCurrentWeek,
                           }: Readonly<WeekPickerProps>) {
    return (
        <Bar>
            <ArrowButton type="button" onClick={onPreviousWeek} aria-label="Previous week">
                <Chevron aria-hidden="true" $direction="left"/>
            </ArrowButton>

            <Label aria-live="polite">{weekLabel(monday)}</Label>

            <ArrowButton type="button" onClick={onNextWeek} aria-label="Next week">
                <Chevron aria-hidden="true" $direction="right"/>
            </ArrowButton>

            <Button
                $variant="secondary"
                $size="sm"
                onClick={onToday}
                disabled={isCurrentWeek}
            >
                Today
            </Button>
        </Bar>
    );
}

const Bar = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
`;

const ArrowButton = styled.button`
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast);

    &:hover {
        background: var(--color-surface-hover);
        border-color: var(--color-border-strong);
    }
`;

const Chevron = styled.span<{ $direction: "left" | "right" }>`
    width: 8px;
    height: 8px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: rotate(${(props) => (props.$direction === "left" ? "-135deg" : "45deg")});
    margin-left: ${(props) => (props.$direction === "left" ? "3px" : "-3px")};
`;

const Label = styled.span`
    min-width: 170px;
    text-align: center;
    font-weight: var(--weight-semibold);
    font-variant-numeric: tabular-nums;
`;

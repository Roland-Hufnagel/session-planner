import {useRef} from "react";
import styled from "styled-components";
import type {User} from "../../types/user";
import {UserAvatar} from "../users/UserAvatar";

type CoachPickerProps = {
    shiftId: string;
    currentCoachId: string | null;
    coaches: User[];
    onAssign: (coach: User | null) => void;
};

/**
 * Coach-Auswahl auf einer Shift-Karte.
 *
 * Nutzt das native popover-Attribut wie das Burgermenue in MainNav: Escape,
 * Klick-daneben und Fokus-Rueckgabe kommen vom Browser. Kein State fuer
 * offen/geschlossen.
 *
 * Anders als dort ist die Position nicht fix – die Karte kann irgendwo im Raster
 * liegen. Deshalb wird sie beim Klick aus der Button-Position berechnet. CSS
 * Anchor Positioning waere der elegantere Weg, ist aber noch nicht in allen
 * Browsern verfuegbar.
 */
export function CoachPicker({
                                shiftId,
                                currentCoachId,
                                coaches,
                                onAssign,
                            }: Readonly<CoachPickerProps>) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const popoverId = `coach-picker-${shiftId}`;

    // Wo die Liste erscheint muss berechnet werden, da sie sonst abgeschnitten sein kann.
    function positionList() {
        const button = buttonRef.current;
        const list = listRef.current;
        if (!button || !list) return;

        const rect = button.getBoundingClientRect();

        const estimatedHeight = Math.min(
            LIST_MAX_HEIGHT,
            (coaches.length + 1) * OPTION_HEIGHT + LIST_PADDING * 2,
        );

        const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
        const spaceAbove = rect.top - VIEWPORT_MARGIN;
        const openUpwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

        if (openUpwards) {
            list.style.top = "auto";
            list.style.bottom = `${window.innerHeight - rect.top + GAP}px`;
        } else {
            list.style.bottom = "auto";
            list.style.top = `${rect.bottom + GAP}px`;
        }

        const usableHeight = (openUpwards ? spaceAbove : spaceBelow) - GAP;
        list.style.maxHeight = `${Math.max(MIN_LIST_HEIGHT, Math.min(LIST_MAX_HEIGHT, usableHeight))}px`;

        const left = Math.min(rect.left, window.innerWidth - LIST_WIDTH - VIEWPORT_MARGIN);
        list.style.left = `${Math.max(VIEWPORT_MARGIN, left)}px`;
    }

    function choose(coach: User | null) {
        listRef.current?.hidePopover();
        onAssign(coach);
    }

    return (
        <>
            <PickerButton
                ref={buttonRef}
                type="button"
                popoverTarget={popoverId}
                aria-label="Assign coach"
                title="Assign coach"
                onClick={(event) => {
                    event.stopPropagation();
                    positionList();
                }}
            >
                <Chevron aria-hidden="true"/>
            </PickerButton>

            <List ref={listRef} id={popoverId} popover="auto" aria-label="Coaches">
                <Option
                    type="button"
                    $selected={currentCoachId === null}
                    onClick={() => choose(null)}
                >
                    <UnassignedMark aria-hidden="true">—</UnassignedMark>
                    Unassigned
                </Option>

                {coaches.map((coach) => (
                    <Option
                        key={coach.id}
                        type="button"
                        $selected={coach.id === currentCoachId}
                        onClick={() => choose(coach)}
                    >
                        <UserAvatar user={coach}/>
                        {coach.nickname}
                    </Option>
                ))}
            </List>
        </>
    );
}

/*
 * Diese Werte teilen sich JS und CSS: positionList() rechnet mit ihnen, die
 * styled-components setzen sie. Sie muessen zusammenpassen, sonst faellt die
 * Flip-Entscheidung auf falscher Grundlage.
 */
const LIST_WIDTH = 220;
const LIST_MAX_HEIGHT = 320;
/** Hoehe einer Option: Avatar 36px + 2x padding var(--space-2) + gap. */
const OPTION_HEIGHT = 54;
const LIST_PADDING = 4;
const GAP = 4;
const VIEWPORT_MARGIN = 8;
/** Darunter wird die Liste unbrauchbar – dann lieber ueberlappen als 20px hoch. */
const MIN_LIST_HEIGHT = 120;

const PickerButton = styled.button`
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    /* Ueber dem Klick-Overlay der Karte (z-index: 1 in ShiftEditor), sonst
       oeffnet ein Klick auf den Picker das Bearbeiten-Formular. z-index braucht
       eine Position, deshalb relative. */
    position: relative;
    z-index: 2;
    border: none;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
        background: rgba(255, 255, 255, 0.35);
    }
`;

const Chevron = styled.span`
    width: 5px;
    height: 5px;
    border-bottom: 1.5px solid currentColor;
    border-right: 1.5px solid currentColor;
    transform: rotate(45deg) translate(-1px, -1px);
`;

const List = styled.div`
    position: fixed;
    inset: auto;
    margin: 0;

    width: ${LIST_WIDTH}px;
    /* max-height wird von positionList() ueberschrieben – hier nur der
       Ausgangswert, damit die Liste auch ohne JS begrenzt bleibt. */
    max-height: ${LIST_MAX_HEIGHT}px;
    padding: ${LIST_PADDING}px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-3);
    overflow-y: auto;

    &:popover-open {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
`;

const Option = styled.button<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border: none;
    border-radius: var(--radius-sm);
    background: ${(props) => (props.$selected ? "var(--color-primary-soft)" : "transparent")};
    color: ${(props) => (props.$selected ? "var(--color-primary)" : "var(--color-text)")};
    font-size: var(--text-sm);
    font-weight: ${(props) =>
            props.$selected ? "var(--weight-semibold)" : "var(--weight-regular)"};
    text-align: left;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
        background: var(--color-surface-hover);
    }
`;

const UnassignedMark = styled.span`
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    color: var(--color-text-muted);
`;

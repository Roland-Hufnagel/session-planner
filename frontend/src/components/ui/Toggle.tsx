import type {ReactNode} from "react";
import styled from "styled-components";

type ToggleProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: ReactNode;
    disabled?: boolean;
};

export function Toggle({checked, onChange, children, disabled = false}: Readonly<ToggleProps>) {
    return (
        <Label $disabled={disabled}>
            <HiddenCheckbox
                type="checkbox"
                role="switch"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
            />
            <Track aria-hidden="true">
                <Knob/>
            </Track>
            {children}
        </Label>
    );
}

const TRACK_WIDTH = "40px";
const TRACK_HEIGHT = "22px";
const KNOB_SIZE = "16px";
const KNOB_INSET = "3px";

const Label = styled.label<{ $disabled: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
    opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
    user-select: none;
`;

const Track = styled.span`
    position: relative;
    flex-shrink: 0;
    width: ${TRACK_WIDTH};
    height: ${TRACK_HEIGHT};
    border-radius: var(--radius-pill);
    background: var(--color-border-strong);
    transition: background var(--transition-fast);
`;

const Knob = styled.span`
    position: absolute;
    top: ${KNOB_INSET};
    left: ${KNOB_INSET};
    width: ${KNOB_SIZE};
    height: ${KNOB_SIZE};
    border-radius: var(--radius-pill);
    background: #ffffff;
    box-shadow: var(--shadow-1);
    transition: transform var(--transition-fast);
`;

const HiddenCheckbox = styled.input`
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    padding: 0;
    border: 0;
    opacity: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;

    &:checked + ${Track} {
        background: var(--color-primary);
    }

    &:checked + ${Track} > ${Knob} {
        transform: translateX(calc(${TRACK_WIDTH} - ${KNOB_SIZE} - 2 * ${KNOB_INSET}));
    }

    &:focus-visible + ${Track} {
        box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
`;

import {useId} from "react";
import styled from "styled-components";
import {COHORT_COLORS, isPaletteColor} from "../../styles/cohortColors";

type CohortColorPickerProps = {
    value: string;
    onChange: (colorCode: string) => void;
    error?: string;
};


export function CohortColorPicker({value, onChange, error}: Readonly<CohortColorPickerProps>) {

    const id = useId();
    const errorId = `${id}-error`;

    return (
        <Group aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)}>
            <Legend>Color</Legend>

            <Swatches>
                {COHORT_COLORS.map((color) => (
                    <SwatchLabel key={color.value} title={color.label}>
                        <RadioInput
                            type="radio"
                            name={id}
                            value={color.value}
                            checked={color.value.toLowerCase() === value.toLowerCase()}
                            onChange={() => onChange(color.value)}
                        />
                        <Swatch style={{background: color.value}}>{color.label}</Swatch>
                    </SwatchLabel>
                ))}

                {!isPaletteColor(value) && (
                    <SwatchLabel title={`${value} (not in palette)`}>
                        <RadioInput type="radio" name={id} value={value} checked readOnly/>
                        <Swatch style={{background: value}}>Current</Swatch>
                    </SwatchLabel>
                )}
            </Swatches>

            {error && (
                <ErrorText id={errorId} role="alert">
                    {error}
                </ErrorText>
            )}
        </Group>
    );
}

const Group = styled.fieldset`
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    border: none;
`;

const Legend = styled.legend`
    padding: 0;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
`;

const Swatches = styled.div`
    margin-top: 0.5em;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: var(--space-2);

    @media (max-width: 480px) {
        grid-template-columns: repeat(4, 1fr);
    }
`;

const SwatchLabel = styled.label`
    position: relative;
    cursor: pointer;
`;

const Swatch = styled.span`
    display: grid;
    place-items: center;
    height: 42px;
    padding: 0 var(--space-1);
    border-radius: var(--radius-md);
    color: #ffffff;
    font-size: var(--text-2xs);
    font-weight: var(--weight-semibold);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
    transition: box-shadow var(--transition-fast);
`;


const RadioInput = styled.input`
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    padding: 0;
    border: 0;
    opacity: 0;
    overflow: hidden;
    clip-path: inset(50%);

    &:checked + ${Swatch} {
        box-shadow: inset 0 0 0 2px var(--color-surface), 0 0 0 2px var(--color-text);
    }

    &:focus-visible + ${Swatch} {
        box-shadow: inset 0 0 0 2px var(--color-surface), 0 0 0 3px var(--color-focus-ring);
    }
`;

const ErrorText = styled.span`
    font-size: var(--text-sm);
    color: var(--color-danger);
`;

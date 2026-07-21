// noinspection CssUnresolvedCustomProperty

import {useId, type ReactNode} from "react";
import styled from "styled-components";

type FieldProps = {
    label: string;
    error?: string;
    /** Render-Prop: bekommt id + aria-Attribute, die an das Control gehoeren. */
    children: (props: {
        id: string;
        "aria-invalid": boolean;
        "aria-describedby": string | undefined;
    }) => ReactNode;
};

/**
 * Label + Control + Fehlertext als Einheit.
 *
 * Verbindet Label und Eingabe ueber eine generierte id (Klick aufs Label
 * fokussiert das Feld) und meldet Fehler barrierefrei via aria-invalid /
 * aria-describedby. Das konkrete Control (Input/Select) kommt als Render-Prop,
 * damit Field mit jedem Formularelement funktioniert.
 */
export function Field({label, error, children}: Readonly<FieldProps>) {
    const id = useId();
    const errorId = `${id}-error`;

    return (
        <Wrapper>
            <Label htmlFor={id}>{label}</Label>
            {children({
                id,
                "aria-invalid": Boolean(error),
                "aria-describedby": error ? errorId : undefined,
            })}
            {error && (
                <ErrorText id={errorId} role="alert">
                    {error}
                </ErrorText>
            )}
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
`;

const Label = styled.label`
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
`;

const ErrorText = styled.span`
    font-size: var(--text-sm);
    color: var(--color-danger);
`;

/**
 * Basis-Styles fuer Text-Eingaben und Selects – als styled-Komponenten,
 * damit sie den Field-Render-Prop direkt entgegennehmen koennen.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const Input = styled.input`
    height: 42px;
    padding: 0 var(--space-3);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

    &::placeholder {
        color: var(--color-text-muted);
    }

    &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-focus-ring);
    }

    &[aria-invalid="true"] {
        border-color: var(--color-danger);
    }
`;

// eslint-disable-next-line react-refresh/only-export-components
export const Select = styled.select`
    height: 42px;
    padding: 0 var(--space-3);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

    &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-focus-ring);
    }

    &[aria-invalid="true"] {
        border-color: var(--color-danger);
    }
`;

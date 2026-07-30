import {useState, type SyntheticEvent} from "react";
import styled from "styled-components";
import {
    DEPARTMENT_LABELS,
    DEPARTMENTS,
    FEDERAL_STATE_LABELS,
    FEDERAL_STATES,
    toCohortInput,
    type Cohort,
    type CohortInput,
    type Department,
    type FederalState,
} from "../../types/cohort";
import {getErrorMessage, getValidationErrors} from "../../api/errors";
import {Button} from "../ui/Button";
import {ColorInput, Field, Input, Select} from "../ui/Field";
import {Form, FormError, Actions} from "../ui/FormLayout.ts";

type CohortFormProps = {
    /** Vorhandene Cohort beim Bearbeiten; undefined beim Anlegen. */
    initial?: Cohort;
    onSubmit: (input: CohortInput) => Promise<void>;
    onCancel: () => void;
};

const EMPTY: CohortInput = {
    name: "",
    nickname: "",
    startDate: "",
    endDate: "",
    federalState: "HH",
    department: "WD",
    // type="color" hat keinen leeren Zustand – ohne Startwert waere es Schwarz.
    colorCode: "#d93500",
};

/**
 * Formular zum Anlegen/Bearbeiten einer Cohort.
 *
 * Haelt die Feldwerte lokal und uebergibt beim Absenden an onSubmit
 * (add/edit aus useCohorts). Schlaegt das Backend mit 400 fehl, werden dessen
 * feldbezogene validationErrors direkt den passenden Feldern zugeordnet;
 * andere Fehler (z.B. 409 doppelter Cohort-Name) erscheinen als
 * Formular-Meldung.
 *
 * Die Datumsfelder brauchen keine Umrechnung: <input type="date"> liefert
 * genau das ISO-Format, das das Backend als LocalDate liest.
 */
export function CohortForm({initial, onSubmit, onCancel}: Readonly<CohortFormProps>) {
    const [values, setValues] = useState<CohortInput>(initial ? toCohortInput(initial) : EMPTY);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function update<K extends keyof CohortInput>(key: K, value: CohortInput[K]) {
        setValues((prev) => ({...prev, [key]: value}));
    }

    async function handleSubmit(event: SyntheticEvent) {
        event.preventDefault();
        setSubmitting(true);
        setFieldErrors({});
        setFormError(null);
        try {
            // Leeren Nickname als undefined senden (Feld ist optional -> NULL in der DB).
            await onSubmit({...values, nickname: values.nickname?.trim() || undefined});
        } catch (error) {
            const validation = getValidationErrors(error);
            if (Object.keys(validation).length > 0) {
                setFieldErrors(validation);
            } else {
                setFormError(getErrorMessage(error));
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Form onSubmit={handleSubmit} noValidate>
            {formError && <FormError role="alert">{formError}</FormError>}

            <Field label="Name" error={fieldErrors.name}>
                {(props) => (
                    <Input
                        {...props}
                        placeholder="java-25-3"
                        value={values.name}
                        onChange={(event) => update("name", event.target.value)}
                        autoFocus
                    />
                )}
            </Field>

            <Field label="Nickname (optional)" error={fieldErrors.nickname}>
                {(props) => (
                    <Input
                        {...props}
                        value={values.nickname ?? ""}
                        onChange={(event) => update("nickname", event.target.value)}
                    />
                )}
            </Field>

            <TwoColumns>
                <Field label="Start" error={fieldErrors.startDate}>
                    {(props) => (
                        <Input
                            {...props}
                            type="date"
                            value={values.startDate}
                            onChange={(event) => update("startDate", event.target.value)}
                        />
                    )}
                </Field>

                <Field label="End" error={fieldErrors.endDate}>
                    {(props) => (
                        <Input
                            {...props}
                            type="date"
                            value={values.endDate}
                            onChange={(event) => update("endDate", event.target.value)}
                        />
                    )}
                </Field>
            </TwoColumns>

            <TwoColumns>
                <Field label="Department" error={fieldErrors.department}>
                    {(props) => (
                        <Select
                            {...props}
                            value={values.department}
                            onChange={(event) => update("department", event.target.value as Department)}
                        >
                            {DEPARTMENTS.map((department) => (
                                <option key={department} value={department}>
                                    {DEPARTMENT_LABELS[department]}
                                </option>
                            ))}
                        </Select>
                    )}
                </Field>

                <Field label="State" error={fieldErrors.federalState}>
                    {(props) => (
                        <Select
                            {...props}
                            value={values.federalState}
                            onChange={(event) => update("federalState", event.target.value as FederalState)}
                        >
                            {FEDERAL_STATES.map((federalState) => (
                                // lang="de": Die Bundesland-Namen bleiben als Eigennamen deutsch,
                                // die Seite ist aber lang="en" – so bleibt die Aussprache korrekt.
                                <option key={federalState} value={federalState} lang="de">
                                    {FEDERAL_STATE_LABELS[federalState]}
                                </option>
                            ))}
                        </Select>
                    )}
                </Field>
            </TwoColumns>

            <Field label="Color" error={fieldErrors.colorCode}>
                {(props) => (
                    <ColorRow>
                        <ColorInput
                            {...props}
                            type="color"
                            value={values.colorCode}
                            onChange={(event) => update("colorCode", event.target.value)}
                        />
                        <ColorCode>{values.colorCode}</ColorCode>
                    </ColorRow>
                )}
            </Field>

            <Actions>
                <Button type="button" $variant="secondary" onClick={onCancel} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                    {initial ? "Save" : "Create"}
                </Button>
            </Actions>
        </Form>
    );
}


/** Zwei zusammengehoerende Felder in einer Reihe – auf Mobil untereinander. */
const TwoColumns = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const ColorRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
`;

const ColorCode = styled.span`
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
`;


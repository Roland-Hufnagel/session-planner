import {useState, type SyntheticEvent} from "react";
import styled from "styled-components";
import {toShiftInput, type Shift, type ShiftInput} from "../../types/shift";
import type {Cohort} from "../../types/cohort";
import type {User} from "../../types/user";
import {getErrorMessage, getValidationErrors} from "../../api/errors";
import {Button} from "../ui/Button";
import {Field, Input, Select} from "../ui/Field";
import {Form, FormError, Actions} from "../ui/FormLayout.ts";
import {DEFAULT_END, DEFAULT_START, timeSlotsIncluding} from "../../utils/timeSlots";

type ShiftFormProps = {
    /** Vorhandene Shift beim Bearbeiten; undefined beim Anlegen. */
    initial?: Shift;
    /** Vorbelegte Cohorte beim Anlegen – die gerade ausgewaehlte. */
    defaultCohortId?: string;
    cohorts: Cohort[];
    coaches: User[];
    onSubmit: (input: ShiftInput) => Promise<void>;
    onCancel: () => void;
};

export function ShiftForm({
                              initial,
                              defaultCohortId,
                              cohorts,
                              coaches,
                              onSubmit,
                              onCancel,
                          }: Readonly<ShiftFormProps>) {
    const [values, setValues] = useState<ShiftInput>(
        initial
            ? toShiftInput(initial)
            : {
                title: "",
                date: "",
                startTime: DEFAULT_START,
                endTime: DEFAULT_END,
                coachId: null,
                cohortId: defaultCohortId ?? "",
            },
    );
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function update<K extends keyof ShiftInput>(key: K, value: ShiftInput[K]) {
        setValues((prev) => ({...prev, [key]: value}));
    }

    async function handleSubmit(event: SyntheticEvent) {
        event.preventDefault();
        setSubmitting(true);
        setFieldErrors({});
        setFormError(null);
        try {
            await onSubmit(values);
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

            <Field label="Title" error={fieldErrors.title}>
                {(props) => (
                    <Input
                        {...props}
                        placeholder="Morning Session"
                        value={values.title}
                        onChange={(event) => update("title", event.target.value)}
                        autoFocus
                    />
                )}
            </Field>

            <Field label="Date" error={fieldErrors.date}>
                {(props) => (
                    <Input
                        {...props}
                        type="date"
                        value={values.date}
                        onChange={(event) => update("date", event.target.value)}
                    />
                )}
            </Field>

            <TwoColumns>
                <Field label="Start" error={fieldErrors.startTime}>
                    {(props) => (
                        <Select
                            {...props}
                            value={values.startTime}
                            onChange={(event) => update("startTime", event.target.value)}
                        >
                            {timeSlotsIncluding(values.startTime).map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </Select>
                    )}
                </Field>

                <Field label="End" error={fieldErrors.endTime}>
                    {(props) => (
                        <Select
                            {...props}
                            value={values.endTime}
                            onChange={(event) => update("endTime", event.target.value)}
                        >
                            {timeSlotsIncluding(values.endTime).map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </Select>
                    )}
                </Field>
            </TwoColumns>

            <Field label="Cohort" error={fieldErrors.cohortId}>
                {(props) => (
                    <Select
                        {...props}
                        value={values.cohortId}
                        onChange={(event) => update("cohortId", event.target.value)}
                    >
                        <option value="">– please select –</option>
                        {cohorts.map((cohort) => (
                            <option key={cohort.id} value={cohort.id}>
                                {cohort.name}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>

            <Field label="Coach (optional)" error={fieldErrors.coachId}>
                {(props) => (
                    <Select
                        {...props}
                        value={values.coachId ?? ""}
                        // Leere Auswahl bedeutet: unbesetzte Shift -> null ans Backend
                        onChange={(event) => update("coachId", event.target.value || null)}
                    >
                        <option value="">Unassigned</option>
                        {coaches.map((coach) => (
                            <option key={coach.id} value={coach.id}>
                                {coach.nickname}
                            </option>
                        ))}
                    </Select>
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

/** Start und Ende gehoeren zusammen – auf Mobil untereinander. */
const TwoColumns = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

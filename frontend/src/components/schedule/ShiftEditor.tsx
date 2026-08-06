import {useRef, useState, type SyntheticEvent} from "react";
import styled from "styled-components";
import {toShiftInput, type Shift, type ShiftInput} from "../../types/shift";
import {getErrorMessage, getValidationErrors} from "../../api/errors";
import {timeSlotsIncluding} from "../../utils/timeSlots";
import {todayIso} from "../../utils/date";
import {Button} from "../ui/Button";
import {Field, Input, Select} from "../ui/Field";
import {Form, FormError, Actions} from "../ui/FormLayout.ts";

type ShiftEditorProps = {
    shift: Shift;
    onSubmit: (input: ShiftInput) => Promise<void>;
    onDelete: () => Promise<void>;
};

const PAST_DATE_ERROR = "A shift cannot be moved into the past.";

type QuickEditValues = Pick<ShiftInput, "title" | "date" | "startTime" | "endTime">;

function quickEditValues(shift: Shift): QuickEditValues {
    const {title, date, startTime, endTime} = toShiftInput(shift);
    return {title, date, startTime, endTime};
}

export function ShiftEditor({shift, onSubmit, onDelete}: Readonly<ShiftEditorProps>) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const popoverId = `shift-editor-${shift.id}`;
    const headingId = `${popoverId}-heading`;
    const cohortLabel = shift.cohort.nickname || shift.cohort.name;
    const isPast = shift.date < todayIso();

    const [values, setValues] = useState<QuickEditValues>(() => quickEditValues(shift));
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const [hasOpened, setHasOpened] = useState(false);

    function update<K extends keyof QuickEditValues>(key: K, value: QuickEditValues[K]) {
        setValues((previous) => ({...previous, [key]: value}));
    }

    function handleOpen() {
        setHasOpened(true);
        setValues(quickEditValues(shift));
        setFieldErrors({});
        setFormError(null);
        setConfirmingDelete(false);
    }

    async function handleSubmit(event: SyntheticEvent) {
        event.preventDefault();
        setFieldErrors({});
        setFormError(null);
        if (values.date < todayIso()) {
            setFieldErrors({date: PAST_DATE_ERROR});
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({...toShiftInput(shift), ...values});
            popoverRef.current?.hidePopover();
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

    async function handleDelete() {
        setSubmitting(true);
        setFormError(null);
        try {
            await onDelete();
            popoverRef.current?.hidePopover();
        } catch (error) {
            setFormError(getErrorMessage(error));
            setConfirmingDelete(false);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <CardOverlay
                type="button"
                popoverTarget={popoverId}
                aria-label={`${isPast ? "View" : "Edit"} shift: ${cohortLabel}, ${shift.title}`}
                onClick={handleOpen}
            />

            <Sheet
                ref={popoverRef}
                id={popoverId}
                popover="auto"
                aria-labelledby={headingId}
            >
                {hasOpened && (
                    <>
                        <SheetHeader>
                            <CohortHeading id={headingId}>{cohortLabel}</CohortHeading>
                            <CloseButton
                                type="button"
                                aria-label="Close"
                                onClick={() => popoverRef.current?.hidePopover()}
                            >
                                ×
                            </CloseButton>
                        </SheetHeader>

                        <Form onSubmit={handleSubmit} noValidate>
                            {formError && <FormError role="alert">{formError}</FormError>}
                            {isPast && <ReadOnlyNote>Past shift – view only.</ReadOnlyNote>}

                            <Field label="Title" error={fieldErrors.title}>
                                {(props) => (
                                    <Input
                                        {...props}
                                        disabled={isPast}
                                        value={values.title}
                                        onChange={(event) => update("title", event.target.value)}
                                    />
                                )}
                            </Field>

                            <Field label="Date" error={fieldErrors.date}>
                                {(props) => (
                                    <Input
                                        {...props}
                                        type="date"
                                        min={todayIso()}
                                        disabled={isPast}
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
                                            disabled={isPast}
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
                                            disabled={isPast}
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

                            <Actions>
                                {isPast && (
                                    <Button
                                        type="button"
                                        $variant="secondary"
                                        onClick={() => popoverRef.current?.hidePopover()}
                                    >
                                        Close
                                    </Button>
                                )}

                                {!isPast && (confirmingDelete ? (
                                    <>
                                        <ConfirmText>Delete this shift?</ConfirmText>
                                        <Button
                                            type="button"
                                            $variant="secondary"
                                            disabled={submitting}
                                            onClick={() => setConfirmingDelete(false)}
                                        >
                                            Keep
                                        </Button>
                                        <Button
                                            type="button"
                                            $variant="danger"
                                            disabled={submitting}
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <DeleteButton
                                            type="button"
                                            $variant="danger-outline"
                                            disabled={submitting}
                                            onClick={() => setConfirmingDelete(true)}
                                        >
                                            Delete
                                        </DeleteButton>
                                        <Button
                                            type="button"
                                            $variant="secondary"
                                            disabled={submitting}
                                            onClick={() => popoverRef.current?.hidePopover()}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={submitting}>
                                            Save
                                        </Button>
                                    </>
                                ))}
                            </Actions>
                        </Form>
                    </>
                )}
            </Sheet>
        </>
    );
}

const CardOverlay = styled.button`
    position: absolute;
    inset: 0;
    z-index: 1;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: -3px;
        border-radius: var(--radius-md);
    }
`;

const DeleteButton = styled(Button)`
    margin-right: auto;
`;

const ReadOnlyNote = styled.p`
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
`;

const ConfirmText = styled.span`
    margin-right: auto;
    align-self: center;
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
`;

const SheetHeader = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
`;

const CohortHeading = styled.h2`
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const CloseButton = styled.button`
    display: grid;
    place-items: center;
    margin-left: auto;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font-size: var(--text-lg);
    line-height: 1;
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);

    &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }
`;

const Sheet = styled.div`
    position: fixed;
    inset: 0;
    margin: auto;
    height: fit-content;
    width: min(360px, calc(100vw - 2 * var(--space-4)));
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-3);

    &::backdrop {
        background: var(--color-overlay);
    }
`;

const TwoColumns = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

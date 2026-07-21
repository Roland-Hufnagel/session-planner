import {useState, type SyntheticEvent} from "react";
import styled from "styled-components";
import {ROLES, toUserInput, type Role, type User, type UserInput} from "../../types/user";
import {getErrorMessage, getValidationErrors} from "../../api/errors";
import {Button} from "../ui/Button";
import {Field, Input, Select} from "../ui/Field";

type UserFormProps = {
    /** Vorhandener User beim Bearbeiten; undefined beim Anlegen. */
    initial?: User;
    onSubmit: (input: UserInput) => Promise<void>;
    onCancel: () => void;
};

const EMPTY: UserInput = {
    name: "",
    nickname: "",
    role: "COACH",
    githubName: "",
    email: "",
    avatarUrl: "",
};

/**
 * Formular zum Anlegen/Bearbeiten eines Users.
 *
 * Haelt die Feldwerte lokal und uebergibt beim Absenden an onSubmit
 * (add/edit aus useUsers). Schlaegt das Backend mit 400 fehl, werden dessen
 * feldbezogene validationErrors direkt den passenden Feldern zugeordnet;
 * andere Fehler (z.B. 409 doppelter User) erscheinen als Formular-Meldung.
 */
export function UserForm({initial, onSubmit, onCancel}: Readonly<UserFormProps>) {
    const [values, setValues] = useState<UserInput>(initial ? toUserInput(initial) : EMPTY);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function update<K extends keyof UserInput>(key: K, value: UserInput[K]) {
        setValues((prev) => ({...prev, [key]: value}));
    }

    async function handleSubmit(event: SyntheticEvent) {
        event.preventDefault();
        setSubmitting(true);
        setFieldErrors({});
        setFormError(null);
        try {
            // Leeres avatarUrl als undefined senden (Feld ist optional).
            await onSubmit({...values, avatarUrl: values.avatarUrl?.trim() || undefined});
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
                        value={values.name}
                        onChange={(event) => update("name", event.target.value)}
                        autoFocus
                    />
                )}
            </Field>

            <Field label="Nickname" error={fieldErrors.nickname}>
                {(props) => (
                    <Input
                        {...props}
                        value={values.nickname}
                        onChange={(event) => update("nickname", event.target.value)}
                    />
                )}
            </Field>

            <Field label="Rolle" error={fieldErrors.role}>
                {(props) => (
                    <Select
                        {...props}
                        value={values.role}
                        onChange={(event) => update("role", event.target.value as Role)}
                    >
                        {ROLES.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>

            <Field label="GitHub-Name" error={fieldErrors.githubName}>
                {(props) => (
                    <Input
                        {...props}
                        value={values.githubName}
                        onChange={(event) => update("githubName", event.target.value)}
                    />
                )}
            </Field>

            <Field label="E-Mail" error={fieldErrors.email}>
                {(props) => (
                    <Input
                        {...props}
                        type="email"
                        value={values.email}
                        onChange={(event) => update("email", event.target.value)}
                    />
                )}
            </Field>

            <Field label="Avatar-URL (optional)" error={fieldErrors.avatarUrl}>
                {(props) => (
                    <Input
                        {...props}
                        type="url"
                        placeholder="https://…"
                        value={values.avatarUrl ?? ""}
                        onChange={(event) => update("avatarUrl", event.target.value)}
                    />
                )}
            </Field>

            <Actions>
                <Button type="button" $variant="secondary" onClick={onCancel} disabled={submitting}>
                    Abbrechen
                </Button>
                <Button type="submit" disabled={submitting}>
                    {initial ? "Speichern" : "Anlegen"}
                </Button>
            </Actions>
        </Form>
    );
}

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
`;

const FormError = styled.div`
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-danger-soft);
    color: var(--color-danger);
    font-size: var(--text-sm);
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-2);
`;

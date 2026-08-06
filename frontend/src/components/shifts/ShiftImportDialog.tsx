import {useRef, useState, type ChangeEvent} from "react";
import styled from "styled-components";
import type {ParsedShiftRow} from "../../types/shift";
import {getErrorMessage, getValidationErrors} from "../../api/errors";
import {CSV_COLUMNS, parseShiftCsv, withCsvLineNumbers} from "../../utils/csv";
import {Button} from "../ui/Button";
import {FormError, Actions} from "../ui/FormLayout.ts";
import {ShiftPreviewTable} from "./ShiftPreviewTable";

type ShiftImportDialogProps = {
    onImport: (rows: ParsedShiftRow[]) => Promise<void>;
    onCancel: () => void;
};

/**
 * Import einer Shift-CSV: Datei waehlen, Vorschau pruefen, speichern.
 *
 * Nach dem Parsen gibt es genau zwei Wege – eine Fehlermeldung oder die
 * fertige Vorschau samt Save-Button. Kein Zwischenschritt, den der User
 * bestaetigen muesste.
 *
 * Der gesamte Zustand liegt hier und nicht in der ShiftsPage: Das Modal
 * unmountet seinen Inhalt beim Schliessen, damit setzt Cancel alles zurueck.
 */
export function ShiftImportDialog({onImport, onCancel}: Readonly<ShiftImportDialogProps>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedShiftRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // Wert leeren, damit dieselbe Datei nach einer Korrektur erneut ein
        // change-Event ausloest – sonst reagiert der zweite Versuch nicht.
        event.target.value = "";
        if (!file) return;

        setFileName(null);
        setParsedRows(null);
        setError(null);

        const result = parseShiftCsv(await file.text());
        if (!result.ok) {
            setError(result.error);
            return;
        }
        setFileName(file.name);
        setParsedRows(result.rows);
    }

    async function handleSave() {
        if (!parsedRows) return;
        setSaving(true);
        setError(null);
        try {
            await onImport(parsedRows);
        } catch (error) {
            setError(describeServerError(error, parsedRows));
        } finally {
            setSaving(false);
        }
    }

    return (
        <Wrapper>
            <UploadRow>
                <Button
                    type="button"
                    $variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                >
                    Upload CSV
                </Button>
                {/* Versteckt und per Button ausgeloest: Das native Dateifeld
                    laesst sich nicht wie die uebrigen Buttons stylen. */}
                <HiddenFileInput
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileSelected}
                />
                {fileName ? <FileName>{fileName}</FileName> : (
                    <Hint>Columns: {CSV_COLUMNS.join(", ")}</Hint>
                )}
            </UploadRow>

            {error && <FormError role="alert">{error}</FormError>}

            <Actions>
                <Button type="button" $variant="secondary" onClick={onCancel} disabled={saving}>
                    Cancel
                </Button>
                {parsedRows && (
                    <Button type="button" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : `Save all (${parsedRows.length})`}
                    </Button>
                )}
            </Actions>

            {parsedRows && <ShiftPreviewTable rows={parsedRows}/>}
        </Wrapper>
    );
}

/**
 * Bringt die Server-Fehler in eine Form, die auf die Datei zeigt.
 *
 * Das Backend antwortet in zwei Formen: eine flache message (Zeitfehler,
 * unbekannte Cohorte) oder validationErrors mit Feldpfaden. Beide tragen den
 * Payload-Index, der hier zur Zeilennummer wird.
 */
function describeServerError(error: unknown, rows: ParsedShiftRow[]): string {
    const message = withCsvLineNumbers(getErrorMessage(error), rows);
    const fieldErrors = Object.entries(getValidationErrors(error));
    if (fieldErrors.length === 0) return message;

    const details = fieldErrors
        .map(([field, fieldMessage]) => `${describeField(field, rows)}: ${fieldMessage}`)
        .join(" · ");
    return `${message} — ${details}`;
}

/** "shifts[0].title" -> "line 2 (title)" */
function describeField(field: string, rows: ParsedShiftRow[]): string {
    const [location, column] = field.split(".");
    const line = withCsvLineNumbers(location, rows);
    return column ? `${line} (${column})` : line;
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
`;

const UploadRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const FileName = styled.span`
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
`;

const Hint = styled.span`
    color: var(--color-text-muted);
    font-size: var(--text-sm);
`;

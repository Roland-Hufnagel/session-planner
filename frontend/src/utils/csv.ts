import type {ParsedShiftRow} from "../types/shift";

/**
 * Spalten der Import-Datei, in dieser Reihenfolge.
 *
 * Eine Kopfzeile mit genau diesen Namen ist erlaubt, aber nicht noetig – die
 * Dateien aus dem Kursbetrieb enthalten meist direkt Daten.
 */
export const CSV_COLUMNS = ["date", "startTime", "endTime", "title"] as const;

/** Spiegelt @Size(max = 500) am ShiftBatchRequestDto – hier faellt es sofort auf. */
export const MAX_IMPORT_ROWS = 500;

// Deutsche Schreibweise (1.10.2026) und ISO (2026-10-01), fuehrende Nullen optional.
const GERMAN_DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const CLOCK_TIME = /^(\d{1,2}):(\d{2})$/;

/**
 * Ergebnis des Parsens. Als Union statt "rows plus optionaler error", damit der
 * Aufrufer nicht vergessen kann, den Fehlerfall zu behandeln.
 */
export type CsvParseResult =
    | {ok: true; rows: ParsedShiftRow[]}
    | {ok: false; error: string};

/**
 * Liest eine Shift-CSV mit den Spalten date, startTime, endTime, title.
 *
 * Nimmt die Formate, die aus Excel und aus der Hand kommen: Semikolon oder
 * Komma als Trennzeichen, Kopfzeile optional, Datum deutsch oder ISO, Uhrzeit
 * mit oder ohne fuehrende Null. Was zurueckkommt, ist bereits in der Form, die
 * das Backend erwartet ("2026-10-01", "09:00") – die Vorschau zeigt genau das.
 *
 * Alle Meldungen beginnen mit "Wrong format" und nennen die Zeile der Datei.
 */
export function parseShiftCsv(text: string): CsvParseResult {
    // Excel schreibt UTF-8 mit BOM. Ohne Abschneiden verliert die erste Zelle
    // ihre Form und ein korrektes Datum wird abgelehnt.
    const withoutBom = text.replace(/^\uFEFF/, "");
    // \r?\n statt \n: In Windows-Exporten haengt sonst an jedem letzten Feld
    // einer Zeile ein \r und landet still in der Datenbank.
    const lines = withoutBom.split(/\r?\n/);

    const firstIndex = lines.findIndex((line) => line.trim() !== "");
    if (firstIndex === -1) {
        return {ok: false, error: "Wrong format, the file is empty."};
    }

    const delimiter = detectDelimiter(lines[firstIndex]);
    // Wer eine Kopfzeile hat, verliert sie nicht als Datenzeile – wer keine hat,
    // braucht auch keine.
    const hasHeader = isHeaderRow(splitCells(lines[firstIndex], delimiter));

    const rows: ParsedShiftRow[] = [];

    for (let index = hasHeader ? firstIndex + 1 : firstIndex; index < lines.length; index++) {
        const line = lines[index];
        // Leerzeilen ueberspringen – dazu gehoert das \n am Dateiende, das sonst
        // als leere Zeile mitgezaehlt wuerde.
        if (line.trim() === "") continue;

        // 1-basiert wie im Texteditor.
        const lineNumber = index + 1;
        const rowOrError = parseRow(splitCells(line, delimiter), lineNumber);
        if (!rowOrError.ok) return rowOrError;
        rows.push(rowOrError.row);
    }

    if (rows.length === 0) {
        return {ok: false, error: "Wrong format, the file has a header but no shifts."};
    }
    if (rows.length > MAX_IMPORT_ROWS) {
        return {
            ok: false,
            error: `Wrong format, ${rows.length} shifts exceed the limit of ${MAX_IMPORT_ROWS} per import.`,
        };
    }

    return {ok: true, rows};
}

/**
 * Ersetzt die Payload-Indizes aus den Backend-Meldungen ("shifts[3]") durch die
 * Zeilennummer der Datei ("line 5").
 *
 * Noetig, weil beides auseinanderlaeuft: Der Index zaehlt die gesendeten Shifts,
 * die Zeilennummer zaehlt Kopfzeile und Leerzeilen mit.
 */
export function withCsvLineNumbers(text: string, rows: ParsedShiftRow[]): string {
    return text.replace(/shifts\[(\d+)]/g, (match, index: string) => {
        const row = rows[Number(index)];
        return row ? `line ${row.lineNumber}` : match;
    });
}

/**
 * Trennzeichen aus der ersten Zeile ableiten.
 *
 * Deutsches Excel exportiert mit Semikolon. Es ist auch das robustere Zeichen,
 * weil ein Titel wie "React, Hooks" dann ein Komma enthalten darf.
 */
function detectDelimiter(line: string): string {
    return line.includes(";") ? ";" : ",";
}

function splitCells(line: string, delimiter: string): string[] {
    return line.split(delimiter).map((cell) => cell.trim());
}

function isHeaderRow(cells: string[]): boolean {
    return cells.length === CSV_COLUMNS.length
        && cells.every(
            (cell, index) => cell.toLowerCase() === CSV_COLUMNS[index].toLowerCase(),
        );
}

type RowResult =
    | {ok: true; row: ParsedShiftRow}
    | {ok: false; error: string};

function parseRow(cells: string[], lineNumber: number): RowResult {
    if (cells.length !== CSV_COLUMNS.length) {
        return {
            ok: false,
            error: `Wrong format, line ${lineNumber} has ${cells.length} columns instead of `
                + `${CSV_COLUMNS.length} (${CSV_COLUMNS.join(", ")}).`,
        };
    }

    const [rawDate, rawStart, rawEnd, title] = cells;

    const date = toIsoDate(rawDate);
    if (date === null) {
        return {
            ok: false,
            error: `Wrong format, line ${lineNumber}: "${rawDate}" is not a date `
                + `as 1.10.2026 or 2026-10-01.`,
        };
    }

    const startTime = toClockTime(rawStart);
    const endTime = toClockTime(rawEnd);
    if (startTime === null || endTime === null) {
        return {
            ok: false,
            error: `Wrong format, line ${lineNumber}: "${rawStart}" and "${rawEnd}" `
                + `must be times as 9:00 or 09:00.`,
        };
    }

    if (title === "") {
        return {ok: false, error: `Wrong format, line ${lineNumber}: the title is empty.`};
    }

    return {ok: true, row: {title, date, startTime, endTime, lineNumber}};
}

/**
 * Bringt ein Datum auf die ISO-Form, die das Backend als LocalDate erwartet.
 *
 * "1.10.2026" ist der 1. Oktober: Tag vor Monat, wie hierzulande ueblich.
 */
function toIsoDate(value: string): string | null {
    const german = GERMAN_DATE.exec(value);
    if (german) {
        return buildIsoDate(Number(german[3]), Number(german[2]), Number(german[1]));
    }
    const iso = ISO_DATE.exec(value);
    if (iso) {
        return buildIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    }
    return null;
}

/** Baut YYYY-MM-DD und weist Tage zurueck, die es im Monat nicht gibt (31.02.). */
function buildIsoDate(year: number, month: number, day: number): string | null {
    // Date.UTC statt new Date(string): kein Zeitzonen-Versatz. Ein ueberlaufender
    // Tag rutscht in den Folgemonat – genau daran erkennt man ihn wieder.
    const date = new Date(Date.UTC(year, month - 1, day));
    const overflowed = date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day;
    return overflowed ? null : `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Bringt eine Uhrzeit auf HH:MM – aus "9:00" wird "09:00". */
function toClockTime(value: string): string | null {
    const match = CLOCK_TIME.exec(value);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return null;
    return `${pad2(hour)}:${pad2(minute)}`;
}

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}

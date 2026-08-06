import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

/**
 * Das isoWeek-Plugin ist Pflicht, nicht Komfort.
 *
 * dayjs' startOf("week") richtet sich nach der Locale, und die Default-Locale
 * "en" hat SONNTAG als Wochenstart – man bekaeme am Mittwoch den vorherigen
 * Sonntag. startOf("isoWeek") folgt ISO 8601: Die Woche beginnt Montag und
 * endet Sonntag.
 *
 * Die extend-Zeile steht hier im Modul und nicht in main.tsx: So bringt jeder
 * Import dieser Datei das Plugin mit und man kann es nicht vergessen.
 */
dayjs.extend(isoWeek);

const ISO_DATE = "YYYY-MM-DD";

/**
 * Montag der Woche, in der das Datum liegt.
 *
 * Der Sonntag ist der Grund fuer isoWeek: Am Sonntag, dem 02.08.2026, liefert
 * diese Funktion Montag den 27.07. – also die Woche, die heute endet, nicht die
 * kommende. Eine Rechnung ueber getDay() (das fuer Sonntag 0 liefert) landet
 * hier ohne Sonderfall auf dem naechsten Montag und blendet den heutigen Tag aus.
 */
export function mondayOf(date: string | Date = new Date()): string {
    return dayjs(date).startOf("isoWeek").format(ISO_DATE);
}

/** Die sieben Tage einer Woche ab Montag, als ISO-Strings (Mo … So). */
export function weekDaysOf(monday: string): string[] {
    return Array.from({length: 7}, (_unused, index) =>
        dayjs(monday).add(index, "day").format(ISO_DATE),
    );
}

/** Letzter Tag der Woche (Sonntag) – das 'to' fuer die Shift-Abfrage. */
export function sundayOf(monday: string): string {
    return dayjs(monday).add(6, "day").format(ISO_DATE);
}

/** Verschiebt einen Montag um ganze Wochen; delta darf negativ sein. */
export function addWeeks(monday: string, delta: number): string {
    return dayjs(monday).add(delta, "week").format(ISO_DATE);
}

/**
 * Beschriftung fuer den Wochenpicker, z.B. "03.08. – 09.08.2026".
 *
 * Deutsches Datumsformat, konsistent mit formatIsoDate – die UI-Sprache ist
 * englisch, das Zahlenformat bleibt deutsch (bewusste Entscheidung aus SP-7).
 */
export function weekLabel(monday: string): string {
    const start = dayjs(monday);
    return `${start.format("DD.MM.")} – ${start.add(6, "day").format("DD.MM.YYYY")}`;
}

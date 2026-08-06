import dayjs from "dayjs";

export function formatIsoDate(isoDate: string): string {
    return dayjs(isoDate).format("DD.MM.YYYY");
}

// Kuerzt eine ISO-Zeit ("09:00:00") auf die Anzeige ("09:00").
export function formatIsoTime(isoTime: string): string {
    return isoTime.slice(0, 5);
}

// Heute als ISO-String ("2026-08-05") – zum Vergleich mit Backend-Datumsfeldern.
export function todayIso(): string {
    return dayjs().format("YYYY-MM-DD");
}

/**
 * Formatiert ein ISO-Datum ("2025-09-01") fuer die Anzeige ("01.09.2025").
 *
 * Bewusst ohne new Date(): Ein ISO-Datum ohne Zeitzone wird als UTC-Mitternacht
 * interpretiert und kann in westlichen Zeitzonen auf den Vortag rutschen. Die
 * Cohort-Daten sind reine Kalendertage, also wird nur umsortiert.
 */
export function formatIsoDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`;
}


// Kuerzt eine ISO-Zeit ("09:00:00") auf die Anzeige ("09:00").

export function formatIsoTime(isoTime: string): string {
    return isoTime.slice(0, 5);
}

// Heute als ISO-String ("2026-08-05") – zum Vergleich mit Backend-Datumsfeldern.
export function todayIso(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
}

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

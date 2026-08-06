// Auswaehlbare Zeiten in Minuten seit Mitternacht – so bleibt die Rechnung
// ganzzahlig und die Grenzen sind an einer Stelle anpassbar.
const FIRST_SLOT = 8 * 60;        // 08:00
const LAST_SLOT = 18 * 60 + 30;   // 18:30
const SLOT_SIZE = 15;

/** Auswaehlbare Zeiten in 15-Minuten-Schritten, 08:00 bis 18:30. */
export const TIME_SLOTS: string[] = Array.from(
    {length: (LAST_SLOT - FIRST_SLOT) / SLOT_SIZE + 1},
    (_unused, index) => {
        const minutes = FIRST_SLOT + index * SLOT_SIZE;
        const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
        const minute = String(minutes % 60).padStart(2, "0");
        return `${hour}:${minute}`;
    },
);

export const DEFAULT_START = "09:00";
export const DEFAULT_END = "13:00";

/**
 * Ergaenzt einen bestehenden Wert, der nicht ins 15-Minuten-Raster passt.
 *
 * Sonst wuerde das Select beim Bearbeiten einer aelteren Shift (z.B. 09:07) den
 * Wert nicht finden, leer anzeigen und ihn beim Speichern still veraendern.
 */
export function timeSlotsIncluding(currentValue: string): string[] {
    if (!currentValue || TIME_SLOTS.includes(currentValue)) return TIME_SLOTS;
    return [...TIME_SLOTS, currentValue].sort((a, b) => a.localeCompare(b));
}

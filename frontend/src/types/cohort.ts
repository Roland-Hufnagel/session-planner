export type FederalState =
    | "BW" | "BY" | "BE" | "BB" | "HB" | "HH" | "HE" | "MV"
    | "NI" | "NW" | "RP" | "SL" | "SN" | "ST" | "SH" | "TH";

export type Department = "WD" | "ASD" | "JAVA" | "FSD";

/** Ausgeschriebene Bundeslaender fuer die Anzeige; der Code bleibt der Wert. */
export const FEDERAL_STATE_LABELS: Record<FederalState, string> = {
    BW: "Baden-Württemberg",
    BY: "Bayern",
    BE: "Berlin",
    BB: "Brandenburg",
    HB: "Bremen",
    HH: "Hamburg",
    HE: "Hessen",
    MV: "Mecklenburg-Vorpommern",
    NI: "Niedersachsen",
    NW: "Nordrhein-Westfalen",
    RP: "Rheinland-Pfalz",
    SL: "Saarland",
    SN: "Sachsen",
    ST: "Sachsen-Anhalt",
    SH: "Schleswig-Holstein",
    TH: "Thüringen",
};

/**
 * Die Kuerzel sind bei neuefische selbst der gebraeuchliche Name, daher steht
 * hier der Code als Label. Ausgeschriebene Namen kommen an dieser einen Stelle
 * rein, falls sie doch gewuenscht sind.
 */
export const DEPARTMENT_LABELS: Record<Department, string> = {
    WD: "WD",
    ASD: "ASD",
    JAVA: "JAVA",
    FSD: "FSD",
};

export const FEDERAL_STATES = Object.keys(FEDERAL_STATE_LABELS) as FederalState[];

export const DEPARTMENTS = Object.keys(DEPARTMENT_LABELS) as Department[];

/**
 * Eine Cohort, wie sie das Backend ausliefert (CohortResponseDto).
 *
 * startDate/endDate sind ISO-Strings ("2025-09-01") – so kommt LocalDate
 * ueber JSON an und genau so erwartet es <input type="date"> auch wieder.
 */
export type Cohort = {
    id: string;
    name: string;
    /** Optional – das Backend laesst die Spalte NULL zu. */
    nickname?: string;
    startDate: string;
    endDate: string;
    federalState: FederalState;
    department: Department;
    colorCode: string;
};

/** Die Felder, die zum Anlegen/Bearbeiten ans Backend gehen (CohortRequestDto). */
export type CohortInput = {
    name: string;
    nickname?: string;
    startDate: string;
    endDate: string;
    federalState: FederalState;
    department: Department;
    colorCode: string;
};

/** Loest die id aus einer Cohort heraus -> nur die editierbaren Felder. */
export function toCohortInput(cohort: Cohort): CohortInput {
    const {name, nickname, startDate, endDate, federalState, department, colorCode} = cohort;
    return {name, nickname, startDate, endDate, federalState, department, colorCode};
}

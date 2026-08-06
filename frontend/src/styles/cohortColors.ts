export type CohortColor = {
    value: string;
    label: string;
};

export const COHORT_COLORS: readonly CohortColor[] = [
    {value: "#C62828", label: "Red"},
    {value: "#8E3200", label: "Rust"},
    {value: "#4E342E", label: "Brown"},
    {value: "#827717", label: "Olive"},
    {value: "#1B5E20", label: "Green"},
    {value: "#00796B", label: "Teal"},
    {value: "#0B3C5D", label: "Navy"},
    {value: "#1565C0", label: "Blue"},
    {value: "#283593", label: "Indigo"},
    {value: "#6A1B9A", label: "Purple"},
    {value: "#880E4F", label: "Magenta"},
    {value: "#455A64", label: "Slate"},
];

export const DEFAULT_COHORT_COLOR = "#1565C0";

export function isPaletteColor(colorCode: string): boolean {
    return COHORT_COLORS.some(
        (color) => color.value.toLowerCase() === colorCode.toLowerCase(),
    );
}

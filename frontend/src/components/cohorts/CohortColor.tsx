import styled from "styled-components";

/**
 * Farbmarke einer Cohort – das visuelle Pendant zum User-Avatar.
 *
 * Die Farbe kommt als inline style, nicht als styled-components-Prop: Sie ist
 * ein echter Datenwert, und pro Farbe eine eigene generierte CSS-Klasse zu
 * erzeugen waere Verschwendung. Dekorativ (aria-hidden), weil direkt daneben
 * immer der Cohort-Name steht.
 */
export function CohortColor({colorCode}: Readonly<{ colorCode: string }>) {
    return <Swatch style={{background: colorCode}} aria-hidden="true"/>;
}

const Swatch = styled.span`
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
`;

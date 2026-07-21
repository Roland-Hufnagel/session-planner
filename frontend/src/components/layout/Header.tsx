import styled from "styled-components";
import {useTheme} from "../../hooks/useTheme";

/** App-Kopfzeile mit Titel und Theme-Umschalter. */
export function Header() {
    const {theme, toggleTheme} = useTheme();

    return (
        <Bar>
            <Inner>
                <Brand>
                    <Dot aria-hidden="true"/>
                    Session Planner
                </Brand>
                <ThemeToggle
                    type="button"
                    onClick={toggleTheme}
                    aria-label={theme === "light" ? "Dunkles Design aktivieren" : "Helles Design aktivieren"}
                    title={theme === "light" ? "Dunkles Design" : "Helles Design"}
                >
                    {theme === "light" ? "🌙" : "☀️"}
                </ThemeToggle>
            </Inner>
        </Bar>
    );
}

const Bar = styled.header`
    position: sticky;
    top: 0;
    z-index: 10;
    height: var(--header-height);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-1);
`;

const Inner = styled.div`
    max-width: var(--content-max-width);
    height: 100%;
    margin: 0 auto;
    padding: 0 var(--space-5);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Brand = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: var(--weight-bold);
    letter-spacing: -0.01em;
`;

const Dot = styled.span`
    width: 12px;
    height: 12px;
    border-radius: var(--radius-pill);
    background: var(--color-primary);
`;

const ThemeToggle = styled.button`
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    font-size: var(--text-lg);
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast);

    &:hover {
        background: var(--color-surface-hover);
        border-color: var(--color-border-strong);
    }
`;

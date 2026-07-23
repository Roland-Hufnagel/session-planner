import styled from "styled-components";
import {useTheme} from "../../hooks/useTheme";
import {useAuth} from "../../hooks/useAuth.ts";

/** App-Kopfzeile mit Titel und Theme-Umschalter. */
export function Header() {
    const {theme, toggleTheme} = useTheme();
    const {user} = useAuth();

    return (
        <Bar>
            <Inner>
                <Brand>
                    <Dot aria-hidden="true"/>
                    Session Planner
                </Brand>
                <Right>
                    {user && (
                        <UserInfo>
                            <Avatar src={user.avatar_url} alt=""/>
                            <span>{user.name ?? user.login}</span>
                        </UserInfo>
                    )}

                    <ThemeToggle
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === "light" ? "Dunkles Design aktivieren" : "Helles Design aktivieren"}
                        title={theme === "light" ? "Dunkles Design" : "Helles Design"}
                    >
                        {theme === "light" ? "🌙" : "☀️"}
                    </ThemeToggle>
                </Right>
            </Inner>
        </Bar>
    );
}

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
`;

const UserInfo = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
`;

const Avatar = styled.img`
    width: 32px;
    height: 32px;
    border-radius: var(--radius-pill);
`;
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

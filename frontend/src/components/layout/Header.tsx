import styled from "styled-components";
import {useTheme} from "../../hooks/useTheme";
import {useAuth} from "../../hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";
import {Button} from "../ui/Button.tsx";
import {MainNav} from "./MainNav";

/** App-Kopfzeile mit Titel, Navigation und Theme-Umschalter. */
export function Header() {
    const {theme, toggleTheme} = useTheme();
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <Bar>
            <Inner>
                <Left>
                    <Brand>
                        <Dot aria-hidden="true"/>
                        Session Planner
                    </Brand>
                    {/* Navigation nur fuer Eingeloggte – die Views dahinter sind geschuetzt. */}
                    {user && <MainNav/>}
                </Left>
                <Right>
                    {user && (
                        <UserInfo>
                            <Avatar src={user.avatarUrl ?? undefined} alt=""/>
                            <UserName>{user.name ?? user.login}</UserName>
                        </UserInfo>
                    )}
                    {user &&
                        <LogoutButton $variant="secondary" $size="sm" onClick={handleLogout} aria-label="Logout">
                            <LogoutIcon
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </LogoutIcon>
                            <LogoutLabel>Logout</LogoutLabel>
                        </LogoutButton>}
                    <ThemeToggle
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                        title={theme === "light" ? "Dark theme" : "Light theme"}
                    >
                        {theme === "light" ? "🌙" : "☀️"}
                    </ThemeToggle>
                </Right>
            </Inner>
        </Bar>
    );
}

const MOBILE_BREAKPOINT = "640px";

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-5);
`;

const UserName = styled.span`
    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: none;
    }
`;
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
    width: 40px;
    height: 40px;
    border-radius: var(--radius-pill);
`;


const LogoutLabel = styled.span`
    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: none;
    }
`;

const LogoutIcon = styled.svg`
    width: 18px;
    height: 18px;
    display: none;

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: block;
    }
`;


const LogoutButton = styled(Button)`
    height: 40px;

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        width: 40px;
        padding: 0;
    }
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

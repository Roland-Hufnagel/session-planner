import {useRef} from "react";
import {NavLink} from "react-router-dom";
import styled from "styled-components";

const LINKS = [
    {to: "/schedule", label: "Schedule"},
    {to: "/users", label: "Users"},
    {to: "/cohorts", label: "Cohorts"},
    {to: "/shifts", label: "Shifts"},
];

/** Ab hier wird es mit Brand + Navigation + Nutzerbereich zu eng. */
const NARROW_BREAKPOINT = "520px";

const MENU_ID = "main-nav-menu";

/**
 * Hauptnavigation zwischen den Ressourcen-Views.
 *
 * NavLink statt Link: react-router setzt bei der aktiven Route automatisch
 * aria-current="page" – damit ist die Markierung auch fuer Screenreader da und
 * kann per Attribut-Selektor gestylt werden, ohne eigenen State.
 *
 * Auf schmalen Screens klappen die Links in ein Burgermenue. Es basiert auf dem
 * nativen popover-Attribut: Der Browser liefert Oeffnen/Schliessen, Escape,
 * Light-Dismiss (Klick daneben) und die Fokus-Rueckgabe an den Button gratis –
 * kein State, kein Outside-Click-Listener, keine Dependency. Gleiche Haltung wie
 * beim <dialog> in Modal.tsx.
 *
 * Breite und schmale Variante stehen beide im Markup und werden per CSS
 * umgeschaltet. Das per display:none ausgeblendete Menue ist auch aus dem
 * Accessibility-Tree raus, es gibt also nie zwei Navigationen gleichzeitig.
 */
export function MainNav() {
    const menuRef = useRef<HTMLElement>(null);

    return (
        <>
            <WideNav aria-label="Main navigation">
                {LINKS.map((link) => (
                    <Item key={link.to} to={link.to}>
                        {link.label}
                    </Item>
                ))}
            </WideNav>

            <BurgerButton type="button" popoverTarget={MENU_ID} aria-label="Open navigation">
                <BurgerIcon
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <line x1="4" y1="7" x2="20" y2="7"/>
                    <line x1="4" y1="12" x2="20" y2="12"/>
                    <line x1="4" y1="17" x2="20" y2="17"/>
                </BurgerIcon>
            </BurgerButton>

            <Menu ref={menuRef} id={MENU_ID} popover="auto" aria-label="Main navigation">
                {LINKS.map((link) => (
                    <Item
                        key={link.to}
                        to={link.to}
                        // React Router navigiert ohne Reload, das Menue muesste
                        // also von Hand zu.
                        onClick={() => menuRef.current?.hidePopover()}
                    >
                        {link.label}
                    </Item>
                ))}
            </Menu>
        </>
    );
}

const WideNav = styled.nav`
    display: flex;
    align-items: center;
    gap: var(--space-1);

    @media (max-width: ${NARROW_BREAKPOINT}) {
        display: none;
    }
`;

const BurgerButton = styled.button`
    display: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast);

    &:hover {
        background: var(--color-surface-hover);
        border-color: var(--color-border-strong);
    }

    @media (max-width: ${NARROW_BREAKPOINT}) {
        display: grid;
    }
`;

const BurgerIcon = styled.svg`
    width: 20px;
    height: 20px;
`;

const Menu = styled.nav`
    /* Ein Popover liegt im Top-Layer und bringt UA-Styles mit: inset: 0 und
       margin: auto wuerden es mitten im Viewport zentrieren. Beides ersetzen,
       damit es unter dem Header haengt. */
    position: fixed;
    inset: auto;
    top: var(--header-height);
    left: var(--space-4);
    margin: 0;

    min-width: 180px;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-3);

    &:popover-open {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }
`;

const Item = styled(NavLink)`
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    white-space: nowrap;
    transition: background var(--transition-fast), color var(--transition-fast);

    &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    /* Die aktive Route markiert react-router selbst per aria-current. */
    &[aria-current="page"] {
        background: var(--color-primary-soft);
        color: var(--color-primary);
        font-weight: var(--weight-semibold);
    }
`;

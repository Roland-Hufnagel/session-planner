import styled from "styled-components";
import type {Role} from "../../types/user";

const labels: Record<Role, string> = {
    // A11y: Let screenreaders say 'Admin' instead of 'A-D-M-I-N'
    ADMIN: "Admin",
    COACH: "Coach",
};

/** Farbige Kennzeichnung der Rolle. */
export function RoleBadge({role}: Readonly<{ role: Role }>) {
    return <Badge $role={role}>{labels[role]}</Badge>;
}

const Badge = styled.span<{ $role: Role }>`
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;

    ${(props) =>
            props.$role === "ADMIN"
                    ? `background: var(--color-primary-soft); color: var(--color-primary);`
                    : `background: var(--color-info-soft); color: var(--color-info);`}
`;

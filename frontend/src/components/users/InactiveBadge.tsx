import styled from "styled-components";

export function InactiveBadge() {
    return <Badge>Inactive</Badge>;
}

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
    background: var(--color-surface-2);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
`;

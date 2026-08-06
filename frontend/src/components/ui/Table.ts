import styled from "styled-components";

export const Scroll = styled.div`
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-1);
`;

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    white-space: nowrap;
`;

export const Th = styled.th`
    text-align: left;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    border-bottom: 1px solid var(--color-border);
`;

export const Row = styled.tr`
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover,
    &:focus-visible {
        background: var(--color-surface-hover);
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
    }
`;

export const Td = styled.td`
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;

    tr:last-child & {
        border-bottom: none;
    }
`;

export const Identity = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
`;

export const Name = styled.div`
    font-weight: var(--weight-medium);
`;

export const Nickname = styled.div`
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
`;

export const Muted = styled.span`
    color: var(--color-text-secondary);
`;

export const Unassigned = styled.span`
    color: var(--color-text-muted);
    font-style: italic;
`;
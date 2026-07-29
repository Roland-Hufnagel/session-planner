import styled from "styled-components";

export const Toolbar = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
`;

export const Title = styled.h1`
    font-size: var(--text-2xl);
`;

export const Count = styled.span`
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
`;

export const Info = styled.p`
    color: var(--color-text-secondary);
    padding: var(--space-6);
    text-align: center;
`;

export const ErrorBox = styled.div`
    padding: var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-danger-soft);
    color: var(--color-danger);
`;

export const Empty = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-7) var(--space-5);
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
`;
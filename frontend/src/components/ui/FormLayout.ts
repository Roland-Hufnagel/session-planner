import styled from "styled-components";

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
`;

export const FormError = styled.div`
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-danger-soft);
    color: var(--color-danger);
    font-size: var(--text-sm);
`;

export const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-2);
`;
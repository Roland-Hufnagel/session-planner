import styled from "styled-components";
import {Link} from "react-router-dom";

export const BackLink = styled(Link)`
    display: inline-block;
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--text-sm);

    &:hover {
        color: var(--color-text);
    }
`;

export const Card = styled.div`
    max-width: 640px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-1);
    overflow: hidden;
`;

export const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-5);
    border-bottom: 1px solid var(--color-border);
`;

export const Identity = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
`;

export const Name = styled.h1`
    font-size: var(--text-xl);
`;

export const Nickname = styled.div`
    color: var(--color-text-secondary);
`;

export const Details = styled.dl`
    padding: var(--space-2) var(--space-5);
`;

export const DetailRow = styled.div`
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-3);
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
        border-bottom: none;
    }
`;

export const Dt = styled.dt`
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
`;

export const Dd = styled.dd`
    word-break: break-word;
`;

export const Muted = styled.span`
    color: var(--color-text-muted);
`;

export const CardActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5) var(--space-5);
`;

export const NotFound = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-7) var(--space-5);
    color: var(--color-text-secondary);
`;
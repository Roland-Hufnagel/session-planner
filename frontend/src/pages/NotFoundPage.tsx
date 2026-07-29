import styled from "styled-components";
import {Link} from "react-router-dom";

export function NotFoundPage() {
    return (
        <Wrapper>
            <StatusCode aria-hidden="true">404</StatusCode>
            <Headline>Page not found</Headline>
            <Subline>
                This address doesn't exist – maybe a typo or an outdated link.
            </Subline>
            <HomeLink to="/">Back to home</HomeLink>
        </Wrapper>
    );
}

const Wrapper = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    min-height: calc(100vh - var(--header-height) - var(--space-7));
    padding: var(--space-7) var(--space-4);
    text-align: center;
`;

const StatusCode = styled.p`
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(var(--text-2xl), 12vw, 96px);
    font-weight: var(--weight-bold);
    line-height: 1;
    color: var(--nf-orange);
`;

const Headline = styled.h1`
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
`;

const Subline = styled.p`
    max-width: 44ch;
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--text-md);
    line-height: 1.5;
`;

const HomeLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: var(--space-2) var(--space-5);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--text-md);
    font-weight: var(--weight-medium);
    transition: background var(--transition-fast), border-color var(--transition-fast);

    &:hover {
        background: var(--color-surface-hover);
        border-color: var(--color-text-muted);
    }

    &:active {
        transform: translateY(1px);
    }
`;

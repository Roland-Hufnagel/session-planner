import styled from "styled-components";
import {Navigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../hooks/useAuth.ts";


export function LandingPage() {
    const [searchParams] = useSearchParams();
    const isNotRegistered = searchParams.get("error") === "not_registered";
    const {user, isLoading} = useAuth();

    if (isLoading) return null;
    if (user) return <Navigate to={"/users"} replace/>;


    return (
        <Hero>
            <Eyebrow>neue fische · Session Planner</Eyebrow>
            <Headline>
                Welcome to <Brand>SessionPlanner</Brand>
            </Headline>
            <Subline>
                Plane Cohorten, Shifts und Coach-Zuweisungen an einem Ort –
                klar strukturiert und immer aktuell.
            </Subline>

            <Actions>
                <GitHubLoginLink href="/oauth2/authorization/github">
                    <GitHubMark/>
                    Login with GitHub
                </GitHubLoginLink>
                {isNotRegistered && (
                    <ErrorBanner role="alert">
                        Dein GitHub-Account ist noch nicht für den Session Planner freigeschaltet.
                        Bitte wende dich an einen Coach.
                    </ErrorBanner>
                )}
            </Actions>
        </Hero>
    );
}

/** GitHub-Octocat-Mark als Inline-SVG (erbt die Textfarbe des Buttons). */
function GitHubMark() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                   0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                   -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                   .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                   -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
                   1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
                   1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
                   1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
        </svg>
    );
}

const ErrorBanner = styled.div`
    max-width: 52ch;
    margin-top: var(--space-4);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-danger-soft);
    color: var(--color-danger);
    font-size: var(--text-sm);
`;
const Hero = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    min-height: calc(100vh - var(--header-height) - var(--space-7));
    padding: var(--space-7) var(--space-4);
    text-align: center;
`;

const Eyebrow = styled.p`
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

const Headline = styled.h1`
    font-size: clamp(var(--text-2xl), 6vw, 56px);
    max-width: 18ch;
`;

const Brand = styled.span`
    background: linear-gradient(
            90deg,
            var(--nf-orange) 0%,
            var(--nf-orange-light) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
`;

const Subline = styled.p`
    max-width: 52ch;
    color: var(--color-text-secondary);
    font-size: var(--text-lg);
    line-height: 1.5;
`;

const Actions = styled.div`
    margin-top: var(--space-3);
`;

const GitHubLoginLink = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    height: 42px;
    padding: var(--space-2) var(--space-5);
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: var(--color-primary-contrast);
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.01em;
    box-shadow: var(--shadow-1);
    transition: background var(--transition-fast), box-shadow var(--transition-fast),
    transform var(--transition-fast);

    &:hover {
        background: var(--color-primary-hover);
        box-shadow: var(--shadow-2);
    }

    &:active {
        transform: translateY(1px);
    }
`;

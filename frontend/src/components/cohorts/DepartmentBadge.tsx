import styled from "styled-components";
import {DEPARTMENT_LABELS, type Department} from "../../types/cohort";

/** Kennzeichnung des Studiengangs. */
export function DepartmentBadge({department}: Readonly<{ department: Department }>) {
    return <Badge>{DEPARTMENT_LABELS[department]}</Badge>;
}

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.02em;
    background: var(--color-surface-2);
    color: var(--color-text-secondary);
`;

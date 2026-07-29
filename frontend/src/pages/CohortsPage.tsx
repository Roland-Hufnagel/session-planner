import {useState} from "react";
import styled from "styled-components";
import {useCohorts} from "../hooks/useCohorts";
import {getErrorMessage} from "../api/errors";
import type {CohortInput} from "../types/cohort";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {CohortTable} from "../components/cohorts/CohortTable";
import {CohortForm} from "../components/cohorts/CohortForm";

export function CohortsPage() {
    const {cohorts, error, isLoading, addCohort} = useCohorts();
    const [createOpen, setCreateOpen] = useState(false);

    async function handleCreate(input: CohortInput) {
        await addCohort(input);
        setCreateOpen(false);
    }

    return (
        <>
            <Toolbar>
                <div>
                    <Title>Cohorts</Title>
                    {!isLoading && !error && <Count>{cohorts.length} entries</Count>}
                </div>
                <Button onClick={() => setCreateOpen(true)}>New cohort</Button>
            </Toolbar>

            {isLoading && <Info>Loading cohorts…</Info>}

            {error && (
                <ErrorBox role="alert">
                    Could not load cohorts: {getErrorMessage(error)}
                </ErrorBox>
            )}

            {!isLoading && !error && cohorts.length === 0 && (
                <Empty>
                    <p>No cohorts yet.</p>
                    <Button onClick={() => setCreateOpen(true)}>Create first cohort</Button>
                </Empty>
            )}

            {!isLoading && !error && cohorts.length > 0 && <CohortTable cohorts={cohorts}/>}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New cohort">
                <CohortForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)}/>
            </Modal>
        </>
    );
}

const Toolbar = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
`;

const Title = styled.h1`
    font-size: var(--text-2xl);
`;

const Count = styled.span`
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
`;

const Info = styled.p`
    color: var(--color-text-secondary);
    padding: var(--space-6);
    text-align: center;
`;

const ErrorBox = styled.div`
    padding: var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-danger-soft);
    color: var(--color-danger);
`;

const Empty = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-7) var(--space-5);
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
`;

import {useState} from "react";

import {useCohorts} from "../hooks/useCohorts";
import {getErrorMessage} from "../api/errors";
import type {CohortInput} from "../types/cohort";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {CohortTable} from "../components/cohorts/CohortTable";
import {CohortForm} from "../components/cohorts/CohortForm";
import {Toolbar, Title, Count, Info, ErrorBox, Empty} from "../components/ui/PageState.ts";

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

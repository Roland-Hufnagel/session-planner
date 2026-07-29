import {useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import styled from "styled-components";
import {useCohorts} from "../hooks/useCohorts";
import {getErrorMessage} from "../api/errors";
import {FEDERAL_STATE_LABELS, type CohortInput} from "../types/cohort";
import {formatIsoDate} from "../utils/date";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {ConfirmDialog} from "../components/ui/ConfirmDialog";
import {CohortColor} from "../components/cohorts/CohortColor";
import {DepartmentBadge} from "../components/cohorts/DepartmentBadge";
import {CohortForm} from "../components/cohorts/CohortForm";

/** Detailseite einer Cohort: zeigt die Daten und bietet Bearbeiten/Löschen. */
export function CohortDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {cohorts, error, isLoading, editCohort, removeCohort} = useCohorts();

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const cohort = cohorts.find((candidate) => candidate.id === id);

    async function handleEdit(input: CohortInput) {
        if (!cohort) return;
        await editCohort(cohort.id, input);
        setEditOpen(false);
        navigate("/cohorts");
    }

    async function handleDelete() {
        if (!cohort) return;
        setDeleting(true);
        try {
            await removeCohort(cohort.id);
            navigate("/cohorts");
        } finally {
            setDeleting(false);
        }
    }

    if (isLoading) return <Info>Loading cohort…</Info>;

    if (error) {
        return (
            <ErrorBox role="alert">
                Could not load cohort: {getErrorMessage(error)}
            </ErrorBox>
        );
    }

    if (!cohort) {
        return (
            <NotFound>
                <p>This cohort no longer exists.</p>
                <Button as={Link} to="/cohorts">
                    Back to overview
                </Button>
            </NotFound>
        );
    }

    return (
        <>
            <BackLink to="/cohorts">← Back to overview</BackLink>

            <Card>
                <CardHeader>
                    <Identity>
                        <CohortColor colorCode={cohort.colorCode}/>
                        <div>
                            <Name>{cohort.name}</Name>
                            {cohort.nickname && <Nickname>{cohort.nickname}</Nickname>}
                        </div>
                    </Identity>
                    <DepartmentBadge department={cohort.department}/>
                </CardHeader>

                <Details>
                    <Row>
                        <Dt>Period</Dt>
                        <Dd>
                            {formatIsoDate(cohort.startDate)} – {formatIsoDate(cohort.endDate)}
                        </Dd>
                    </Row>
                    <Row>
                        {/* Die Bundesland-Namen bleiben bewusst deutsch (Eigennamen). */}
                        <Dt>State</Dt>
                        <Dd lang="de">{FEDERAL_STATE_LABELS[cohort.federalState]}</Dd>
                    </Row>
                    <Row>
                        <Dt>Color</Dt>
                        <Dd>{cohort.colorCode}</Dd>
                    </Row>
                    <Row>
                        <Dt>Nickname</Dt>
                        <Dd>{cohort.nickname || <Muted>—</Muted>}</Dd>
                    </Row>
                </Details>

                <Actions>
                    <Button onClick={() => setEditOpen(true)}>Edit</Button>
                    <Button $variant="danger-outline" onClick={() => setDeleteOpen(true)}>
                        Delete
                    </Button>
                </Actions>
            </Card>

            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit cohort">
                <CohortForm initial={cohort} onSubmit={handleEdit} onCancel={() => setEditOpen(false)}/>
            </Modal>

            <ConfirmDialog
                open={deleteOpen}
                title="Delete cohort"
                busy={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteOpen(false)}
            >
                Delete <strong>{cohort.name}</strong>? This cannot be undone.
            </ConfirmDialog>
        </>
    );
}

const BackLink = styled(Link)`
    display: inline-block;
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--text-sm);

    &:hover {
        color: var(--color-text);
    }
`;

const Card = styled.div`
    max-width: 640px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-1);
    overflow: hidden;
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-5);
    border-bottom: 1px solid var(--color-border);
`;

const Identity = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
`;

const Name = styled.h1`
    font-size: var(--text-xl);
`;

const Nickname = styled.div`
    color: var(--color-text-secondary);
`;

const Details = styled.dl`
    padding: var(--space-2) var(--space-5);
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-3);
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
        border-bottom: none;
    }
`;

const Dt = styled.dt`
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
`;

const Dd = styled.dd`
    word-break: break-word;
`;

const Muted = styled.span`
    color: var(--color-text-muted);
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5) var(--space-5);
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

const NotFound = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-7) var(--space-5);
    color: var(--color-text-secondary);
`;

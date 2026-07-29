import {useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
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
import {
    BackLink,
    Card,
    CardHeader,
    Identity,
    Name,
    Nickname,
    Details,
    DetailRow,
    Dt,
    Dd,
    Muted,
    CardActions,
    NotFound
} from "../components/ui/DetailCart.ts";
import {Info, ErrorBox} from "../components/ui/PageState.ts";

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
                    <DetailRow>
                        <Dt>Period</Dt>
                        <Dd>
                            {formatIsoDate(cohort.startDate)} – {formatIsoDate(cohort.endDate)}
                        </Dd>
                    </DetailRow>
                    <DetailRow>
                        {/* Die Bundesland-Namen bleiben bewusst deutsch (Eigennamen). */}
                        <Dt>State</Dt>
                        <Dd lang="de">{FEDERAL_STATE_LABELS[cohort.federalState]}</Dd>
                    </DetailRow>
                    <DetailRow>
                        <Dt>Color</Dt>
                        <Dd>{cohort.colorCode}</Dd>
                    </DetailRow>
                    <DetailRow>
                        <Dt>Nickname</Dt>
                        <Dd>{cohort.nickname || <Muted>—</Muted>}</Dd>
                    </DetailRow>
                </Details>

                <CardActions>
                    <Button onClick={() => setEditOpen(true)}>Edit</Button>
                    <Button $variant="danger-outline" onClick={() => setDeleteOpen(true)}>
                        Delete
                    </Button>
                </CardActions>
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

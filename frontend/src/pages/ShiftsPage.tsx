import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import styled from "styled-components";
import {useShifts} from "../hooks/useShifts";
import {useCohorts} from "../hooks/useCohorts";
import {useUsers} from "../hooks/useUsers";
import {getErrorMessage} from "../api/errors";
import type {Shift, ShiftInput} from "../types/shift";
import {todayIso} from "../utils/date";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {ConfirmDialog} from "../components/ui/ConfirmDialog";
import {Select} from "../components/ui/Field";
import {Toggle} from "../components/ui/Toggle";
import {ShiftTable} from "../components/shifts/ShiftTable";
import {ShiftForm} from "../components/shifts/ShiftForm";
import {Toolbar, Title, Count, Info, ErrorBox, Empty} from "../components/ui/PageState.ts";

export function ShiftsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCohortId = searchParams.get("cohortId");
    const [showEndedCohorts, setShowEndedCohorts] = useState(false);

    const {cohorts, error: cohortsError, isLoading: cohortsLoading} = useCohorts();
    const {users} = useUsers();
    const {shifts, error, isLoading, addShift, editShift, removeShift} =
        useShifts(selectedCohortId);

    const [createOpen, setCreateOpen] = useState(false);
    const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
    const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
    const [deleting, setDeleting] = useState(false);

    const today = todayIso();
    const selectableCohorts = cohorts.filter(
        (cohort) => showEndedCohorts || cohort.endDate >= today,
    );
    const selectableCoaches = users.filter((user) => user.active);

    function handleSelectCohort(cohortId: string) {
        setSearchParams(cohortId ? {cohortId} : {}, {replace: true});
    }

    async function handleCreate(input: ShiftInput) {
        await addShift(input);
        setCreateOpen(false);
    }

    async function handleEdit(input: ShiftInput) {
        if (!shiftToEdit) return;
        await editShift(shiftToEdit.id, input);
        setShiftToEdit(null);
    }

    async function handleDelete() {
        if (!shiftToDelete) return;
        setDeleting(true);
        try {
            await removeShift(shiftToDelete.id);
            setShiftToDelete(null);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <Toolbar>
                <div>
                    <Title>Shifts</Title>
                    {selectedCohortId && !isLoading && !error && (
                        <Count>{shifts.length} entries</Count>
                    )}
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    disabled={selectableCohorts.length === 0}
                >
                    Add shift
                </Button>
            </Toolbar>

            <FilterBar>
                <CohortSelect
                    value={selectedCohortId ?? ""}
                    onChange={(event) => handleSelectCohort(event.target.value)}
                    aria-label="Cohort"
                    disabled={cohortsLoading || selectableCohorts.length === 0}
                >
                    <option value="">– select a cohort –</option>
                    {selectableCohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                            {cohort.name}
                            {cohort.nickname ? ` · ${cohort.nickname}` : ""}
                        </option>
                    ))}
                </CohortSelect>

                <Toggle checked={showEndedCohorts} onChange={setShowEndedCohorts}>
                    Include past cohorts
                </Toggle>
            </FilterBar>

            {cohortsError && (
                <ErrorBox role="alert">
                    Could not load cohorts: {getErrorMessage(cohortsError)}
                </ErrorBox>
            )}

            {!selectedCohortId && !cohortsError && (
                <Empty>
                    <p>Select a cohort to see its shifts.</p>
                </Empty>
            )}

            {selectedCohortId && isLoading && <Info>Loading shifts…</Info>}

            {selectedCohortId && error && (
                <ErrorBox role="alert">
                    Could not load shifts: {getErrorMessage(error)}
                </ErrorBox>
            )}

            {selectedCohortId && !isLoading && !error && shifts.length === 0 && (
                <Empty>
                    <p>This cohort has no shifts yet.</p>
                    <Button onClick={() => setCreateOpen(true)}>Create first shift</Button>
                </Empty>
            )}

            {selectedCohortId && !isLoading && !error && shifts.length > 0 && (
                <ShiftTable
                    shifts={shifts}
                    onEdit={setShiftToEdit}
                    onDelete={setShiftToDelete}
                />
            )}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New shift">
                <ShiftForm
                    defaultCohortId={selectedCohortId ?? undefined}
                    cohorts={selectableCohorts}
                    coaches={selectableCoaches}
                    onSubmit={handleCreate}
                    onCancel={() => setCreateOpen(false)}
                />
            </Modal>

            <Modal
                open={shiftToEdit !== null}
                onClose={() => setShiftToEdit(null)}
                title="Edit shift"
            >
                {shiftToEdit && (
                    <ShiftForm
                        initial={shiftToEdit}
                        cohorts={selectableCohorts}
                        coaches={selectableCoaches}
                        onSubmit={handleEdit}
                        onCancel={() => setShiftToEdit(null)}
                    />
                )}
            </Modal>

            <ConfirmDialog
                open={shiftToDelete !== null}
                title="Delete shift"
                busy={deleting}
                onConfirm={handleDelete}
                onCancel={() => setShiftToDelete(null)}
            >
                Delete <strong>{shiftToDelete?.title}</strong>? This cannot be undone.
            </ConfirmDialog>
        </>
    );
}

const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
    flex-wrap: wrap;
`;

const CohortSelect = styled(Select)`
    min-width: 260px;
`;

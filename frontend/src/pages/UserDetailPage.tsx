import {useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import styled from "styled-components";
import {useUsers} from "../hooks/useUsers";
import {getErrorMessage} from "../api/errors";
import {toUserInput, type UserInput} from "../types/user";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {ConfirmDialog} from "../components/ui/ConfirmDialog";
import {UserAvatar} from "../components/users/UserAvatar";
import {RoleBadge} from "../components/users/RoleBadge";
import {InactiveBadge} from "../components/users/InactiveBadge";
import {UserForm} from "../components/users/UserForm";
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

export function UserDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {users, error, isLoading, editUser, deactivateUser} = useUsers();

    const [editOpen, setEditOpen] = useState(false);
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [deactivating, setDeactivating] = useState(false);
    const [activateOpen, setActivateOpen] = useState(false);
    const [activating, setActivating] = useState(false);

    const user = users.find((candidate) => candidate.id === id);

    async function handleEdit(input: UserInput) {
        if (!user) return;
        await editUser(user.id, input);
        setEditOpen(false);
        navigate("/users");
    }

    async function handleActivate() {
        if (!user) return;
        setActivating(true);
        try {
            await editUser(user.id, {...toUserInput(user), active: true});
            navigate("/users");
        } finally {
            setActivating(false);
        }
    }

    async function handleDeactivate() {
        if (!user) return;
        setDeactivating(true);
        try {
            await deactivateUser(user.id);
            navigate("/users");
        } finally {
            setDeactivating(false);
        }
    }

    if (isLoading) return <Info>Loading user…</Info>;

    if (error) {
        return (
            <ErrorBox role="alert">
                Could not load user: {getErrorMessage(error)}
            </ErrorBox>
        );
    }

    if (!user) {
        return (
            <NotFound>
                <p>This user no longer exists.</p>
                <Button as={Link} to="/users">
                    Back to overview
                </Button>
            </NotFound>
        );
    }

    return (
        <>
            <BackLink to="/users">← Back to overview</BackLink>

            <Card>
                <CardHeader>
                    <Identity>
                        <UserAvatar user={user}/>
                        <div>
                            <Name>{user.name}</Name>
                            <Nickname>@{user.nickname}</Nickname>
                        </div>
                    </Identity>
                    <Badges>
                        <RoleBadge role={user.role}/>
                        {!user.active && <InactiveBadge/>}
                    </Badges>
                </CardHeader>

                <Details>
                    <DetailRow>
                        <Dt>GitHub</Dt>
                        <Dd>{user.githubName}</Dd>
                    </DetailRow>
                    <DetailRow>
                        <Dt>Email</Dt>
                        <Dd>{user.email}</Dd>
                    </DetailRow>
                    <DetailRow>
                        <Dt>Avatar URL</Dt>
                        <Dd>{user.avatarUrl || <Muted>—</Muted>}</Dd>
                    </DetailRow>
                    <DetailRow>
                        <Dt>Status</Dt>
                        <Dd>
                            {user.active
                                ? "Active"
                                : "Inactive – cannot log in, but stays assigned to past shifts"}
                        </Dd>
                    </DetailRow>
                </Details>

                <CardActions>
                    <Button onClick={() => setEditOpen(true)}>Edit</Button>
                    {user.active ? (
                        <Button $variant="danger-outline" onClick={() => setDeactivateOpen(true)}>
                            Deactivate
                        </Button>
                    ) : (
                        <Button $variant="secondary" onClick={() => setActivateOpen(true)}>
                            Activate
                        </Button>
                    )}
                </CardActions>
            </Card>

            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit user">
                <UserForm initial={user} onSubmit={handleEdit} onCancel={() => setEditOpen(false)}/>
            </Modal>

            <ConfirmDialog
                open={deactivateOpen}
                title="Deactivate user"
                confirmLabel="Deactivate"
                busy={deactivating}
                onConfirm={handleDeactivate}
                onCancel={() => setDeactivateOpen(false)}
            >
                Deactivate <strong>{user.name}</strong>? They can no longer log in.
                All shifts keep them as coach, and you can reactivate them later.
            </ConfirmDialog>

            <ConfirmDialog
                open={activateOpen}
                title="Activate user"
                confirmLabel="Activate"
                // Nicht destruktiv -> kein roter Button
                confirmVariant="primary"
                busy={activating}
                onConfirm={handleActivate}
                onCancel={() => setActivateOpen(false)}
            >
                Activate <strong>{user.name}</strong>? Logging in will be possible again,
                and this coach can be assigned to new shifts.
            </ConfirmDialog>
        </>
    );
}

const Badges = styled.div`
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
`;

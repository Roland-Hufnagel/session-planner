import {useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useUsers} from "../hooks/useUsers";
import {getErrorMessage} from "../api/errors";
import type {UserInput} from "../types/user";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {ConfirmDialog} from "../components/ui/ConfirmDialog";
import {UserAvatar} from "../components/users/UserAvatar";
import {RoleBadge} from "../components/users/RoleBadge";
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

/** Detailseite eines Users: zeigt die Daten und bietet Bearbeiten/Löschen. */
export function UserDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {users, error, isLoading, editUser, removeUser} = useUsers();

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const user = users.find((candidate) => candidate.id === id);

    async function handleEdit(input: UserInput) {
        if (!user) return;
        await editUser(user.id, input);
        setEditOpen(false);
        navigate("/users");
    }

    async function handleDelete() {
        if (!user) return;
        setDeleting(true);
        try {
            await removeUser(user.id);
            navigate("/users");
        } finally {
            setDeleting(false);
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
                    <RoleBadge role={user.role}/>
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
                </Details>

                <CardActions>
                    <Button onClick={() => setEditOpen(true)}>Edit</Button>
                    <Button $variant="danger-outline" onClick={() => setDeleteOpen(true)}>
                        Delete
                    </Button>
                </CardActions>
            </Card>

            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit user">
                <UserForm initial={user} onSubmit={handleEdit} onCancel={() => setEditOpen(false)}/>
            </Modal>

            <ConfirmDialog
                open={deleteOpen}
                title="Delete user"
                busy={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteOpen(false)}
            >
                Delete <strong>{user.name}</strong>? This cannot be undone.
            </ConfirmDialog>
        </>
    );
}

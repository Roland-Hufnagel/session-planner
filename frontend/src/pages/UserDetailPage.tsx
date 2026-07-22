import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useUsers } from "../hooks/useUsers";
import { getErrorMessage } from "../api/errors";
import type { UserInput } from "../types/user";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { UserAvatar } from "../components/users/UserAvatar";
import { RoleBadge } from "../components/users/RoleBadge";
import { UserForm } from "../components/users/UserForm";

/** Detailseite eines Users: zeigt die Daten und bietet Bearbeiten/Löschen. */
export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, error, isLoading, editUser, removeUser } = useUsers();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const user = users.find((candidate) => candidate.id === id);

  async function handleEdit(input: UserInput) {
    if (!user) return;
    await editUser(user.id, input);
    setEditOpen(false);
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

  if (isLoading) return <Info>Lade User…</Info>;

  if (error) {
    return (
      <ErrorBox role="alert">
        User konnte nicht geladen werden: {getErrorMessage(error)}
      </ErrorBox>
    );
  }

  if (!user) {
    return (
      <NotFound>
        <p>Dieser User existiert nicht (mehr).</p>
        <Button as={Link} to="/users">
          Zurück zur Übersicht
        </Button>
      </NotFound>
    );
  }

  return (
    <>
      <BackLink to="/users">← Zurück zur Übersicht</BackLink>

      <Card>
        <CardHeader>
          <Identity>
            <UserAvatar user={user} />
            <div>
              <Name>{user.name}</Name>
              <Nickname>@{user.nickname}</Nickname>
            </div>
          </Identity>
          <RoleBadge role={user.role} />
        </CardHeader>

        <Details>
          <Row>
            <Dt>GitHub</Dt>
            <Dd>{user.githubName}</Dd>
          </Row>
          <Row>
            <Dt>E-Mail</Dt>
            <Dd>{user.email}</Dd>
          </Row>
          <Row>
            <Dt>Avatar-URL</Dt>
            <Dd>{user.avatarUrl || <Muted>—</Muted>}</Dd>
          </Row>
        </Details>

        <Actions>
          <Button onClick={() => setEditOpen(true)}>Bearbeiten</Button>
          <Button $variant="danger-outline" onClick={() => setDeleteOpen(true)}>
            Löschen
          </Button>
        </Actions>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="User bearbeiten">
        <UserForm initial={user} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="User löschen"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      >
        Soll <strong>{user.name}</strong> wirklich gelöscht werden? Das kann nicht rückgängig
        gemacht werden.
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

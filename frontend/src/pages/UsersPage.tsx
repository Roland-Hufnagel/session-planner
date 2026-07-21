import {useState} from "react";
import styled from "styled-components";
import {useUsers} from "../hooks/useUsers";
import {getErrorMessage} from "../api/errors";
import type {UserInput} from "../types/user";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {UserTable} from "../components/users/UserTable";
import {UserForm} from "../components/users/UserForm";

export function UsersPage() {
    const {users, error, isLoading, addUser} = useUsers();
    const [createOpen, setCreateOpen] = useState(false);

    async function handleCreate(input: UserInput) {
        await addUser(input);
        setCreateOpen(false);
    }

    return (
        <>
            <Toolbar>
                <div>
                    <Title>Users</Title>
                    {!isLoading && !error && <Count>{users.length} Einträge</Count>}
                </div>
                <Button onClick={() => setCreateOpen(true)}>Neuen User anlegen</Button>
            </Toolbar>

            {isLoading && <Info>Lade Users…</Info>}

            {error && (
                <ErrorBox role="alert">
                    Users konnten nicht geladen werden: {getErrorMessage(error)}
                </ErrorBox>
            )}

            {!isLoading && !error && users.length === 0 && (
                <Empty>
                    <p>Noch keine Users angelegt.</p>
                    <Button onClick={() => setCreateOpen(true)}>Ersten User anlegen</Button>
                </Empty>
            )}

            {!isLoading && !error && users.length > 0 && <UserTable users={users}/>}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Neuen User anlegen">
                <UserForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)}/>
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

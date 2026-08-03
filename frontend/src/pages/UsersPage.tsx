import {useState} from "react";
import styled from "styled-components";
import {useUsers} from "../hooks/useUsers";
import {getErrorMessage} from "../api/errors";
import type {UserInput} from "../types/user";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {UserTable} from "../components/users/UserTable";
import {UserForm} from "../components/users/UserForm";
import {Toggle} from "../components/ui/Toggle";
import {Toolbar, Title, Count, Info, ErrorBox, Empty} from "../components/ui/PageState.ts";

export function UsersPage() {
    const {users, error, isLoading, addUser} = useUsers();
    const [createOpen, setCreateOpen] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    const visibleUsers = users.filter((user) => showInactive || user.active);
    const inactiveCount = users.length - users.filter((user) => user.active).length;

    async function handleCreate(input: UserInput) {
        await addUser(input);
        setCreateOpen(false);
    }

    return (
        <>
            <Toolbar>
                <div>
                    <Title>Users</Title>
                    {!isLoading && !error && <Count>{visibleUsers.length} entries</Count>}
                </div>
                <Button onClick={() => setCreateOpen(true)}>New user</Button>
            </Toolbar>

            {!isLoading && !error && inactiveCount > 0 && (
                <FilterBar>
                    <Toggle checked={showInactive} onChange={setShowInactive}>
                        Include inactive users ({inactiveCount})
                    </Toggle>
                </FilterBar>
            )}

            {isLoading && <Info>Loading users…</Info>}

            {error && (
                <ErrorBox role="alert">
                    Could not load users: {getErrorMessage(error)}
                </ErrorBox>
            )}

            {!isLoading && !error && users.length === 0 && (
                <Empty>
                    <p>No users yet.</p>
                    <Button onClick={() => setCreateOpen(true)}>Create first user</Button>
                </Empty>
            )}

            {!isLoading && !error && users.length > 0 && visibleUsers.length === 0 && (
                <Empty>
                    <p>All users are inactive.</p>
                    <Button $variant="secondary" onClick={() => setShowInactive(true)}>
                        Show inactive users
                    </Button>
                </Empty>
            )}

            {!isLoading && !error && visibleUsers.length > 0 && (
                <UserTable users={visibleUsers}/>
            )}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New user">
                <UserForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)}/>
            </Modal>
        </>
    );
}

const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
`;

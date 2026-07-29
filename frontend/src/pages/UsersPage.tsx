import {useState} from "react";
import {useUsers} from "../hooks/useUsers";
import {getErrorMessage} from "../api/errors";
import type {UserInput} from "../types/user";
import {Button} from "../components/ui/Button";
import {Modal} from "../components/ui/Modal";
import {UserTable} from "../components/users/UserTable";
import {UserForm} from "../components/users/UserForm";
import {Toolbar, Title, Count, Info, ErrorBox, Empty} from "../components/ui/PageState.ts";

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
                    {!isLoading && !error && <Count>{users.length} entries</Count>}
                </div>
                <Button onClick={() => setCreateOpen(true)}>New user</Button>
            </Toolbar>

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

            {!isLoading && !error && users.length > 0 && <UserTable users={users}/>}

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New user">
                <UserForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)}/>
            </Modal>
        </>
    );
}

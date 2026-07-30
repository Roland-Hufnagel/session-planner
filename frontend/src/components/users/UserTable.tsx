import {useNavigate} from "react-router-dom";
import type {User} from "../../types/user";
import {UserAvatar} from "./UserAvatar";
import {RoleBadge} from "./RoleBadge";
import {Scroll, Table, Th, Row, Td, Identity, Name, Nickname, Muted} from "../ui/Table.ts";

/** Nur-Lese-Uebersicht aller User. Ein Klick auf eine Zeile oeffnet die Detailseite. */
export function UserTable({users}: Readonly<{ users: User[] }>) {
    const navigate = useNavigate();

    return (
        <Scroll>
            <Table>
                <thead>
                <tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>GitHub</Th>
                    <Th>Email</Th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <Row
                        key={user.id}
                        onClick={() => navigate(user.id)}
                        // Als Link fuer Tastatur/Screenreader bedienbar machen.
                        role="link"
                        tabIndex={0}
                        aria-label={`Details for ${user.name}`}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                navigate(user.id);
                            }
                        }}
                    >
                        <Td>
                            <Identity>
                                <UserAvatar user={user}/>
                                <div>
                                    <Name>{user.name}</Name>
                                    <Nickname>@{user.nickname}</Nickname>
                                </div>
                            </Identity>
                        </Td>
                        <Td>
                            <RoleBadge role={user.role}/>
                        </Td>
                        <Td>{user.githubName}</Td>
                        <Td>
                            <Muted>{user.email}</Muted>
                        </Td>
                    </Row>
                ))}
                </tbody>
            </Table>
        </Scroll>
    );
}

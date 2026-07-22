import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { User } from "../../types/user";
import { UserAvatar } from "./UserAvatar";
import { RoleBadge } from "./RoleBadge";

/** Nur-Lese-Uebersicht aller User. Ein Klick auf eine Zeile oeffnet die Detailseite. */
export function UserTable({ users }: Readonly<{ users: User[] }>) {
  const navigate = useNavigate();

  return (
    <Scroll>
      <Table>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Rolle</Th>
            <Th>GitHub</Th>
            <Th>E-Mail</Th>
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
              aria-label={`Details zu ${user.name}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(user.id);
                }
              }}
            >
              <Td>
                <Identity>
                  <UserAvatar user={user} />
                  <div>
                    <Name>{user.name}</Name>
                    <Nickname>@{user.nickname}</Nickname>
                  </div>
                </Identity>
              </Td>
              <Td>
                <RoleBadge role={user.role} />
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

const Scroll = styled.div`
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
`;

const Th = styled.th`
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
`;

const Row = styled.tr`
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover,
  &:focus-visible {
    background: var(--color-surface-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
`;

const Td = styled.td`
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;

  tr:last-child & {
    border-bottom: none;
  }
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const Name = styled.div`
  font-weight: var(--weight-medium);
`;

const Nickname = styled.div`
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
`;

const Muted = styled.span`
  color: var(--color-text-secondary);
`;

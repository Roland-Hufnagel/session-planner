import { useState } from "react";
import styled from "styled-components";
import type { User } from "../../types/user";

/** Erzeugt die Initialen aus dem Namen (max. 2 Buchstaben). */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Avatar eines Users: zeigt das GitHub-Bild, faellt bei fehlendem oder
 * kaputtem Bild auf farbige Initialen zurueck.
 */
export function UserAvatar({ user }: Readonly<{ user: Pick<User, "name" | "avatarUrl"> }>) {
  const [failed, setFailed] = useState(false);
  const showImage = user.avatarUrl && !failed;

  if (showImage) {
    return (
      <Image
        src={user.avatarUrl}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return <Fallback aria-hidden="true">{initials(user.name)}</Fallback>;
}

const base = `
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  flex-shrink: 0;
`;

const Image = styled.img`
  ${base}
  object-fit: cover;
  background: var(--color-surface-2);
`;

const Fallback = styled.span`
  ${base}
  display: grid;
  place-items: center;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
`;

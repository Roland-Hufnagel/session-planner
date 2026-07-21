import { type ReactNode } from "react";
import styled from "styled-components";
import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Bestaetigungs-Dialog fuer destruktive Aktionen (z.B. Loeschen). */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Löschen",
  busy = false,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <Message>{children}</Message>
      <Actions>
        <Button $variant="secondary" onClick={onCancel} disabled={busy}>
          Abbrechen
        </Button>
        <Button $variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? "…" : confirmLabel}
        </Button>
      </Actions>
    </Modal>
  );
}

const Message = styled.p`
  color: var(--color-text-secondary);
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-5);
`;

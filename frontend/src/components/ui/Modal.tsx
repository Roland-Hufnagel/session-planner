import { useEffect, useRef, type ReactNode } from "react";
import styled from "styled-components";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Modal auf Basis des nativen <dialog>-Elements.
 *
 * showModal() liefert Fokus-Trap, Escape-zum-Schliessen und das ::backdrop
 * gratis vom Browser – kein Dependency, kein eigener Focus-Manager noetig.
 * Wir spiegeln nur den open-Prop auf showModal()/close() und melden das
 * Schliessen (Escape oder Backdrop-Klick) ueber onClose zurueck.
 */
export function Modal({ open, onClose, title, children }: Readonly<ModalProps>) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Merkt sich, ob die Maus AUF dem Backdrop gedrueckt wurde.
  const pressedOnBackdrop = useRef(false);

  function handleMouseDown(event: React.MouseEvent<HTMLDialogElement>) {
    pressedOnBackdrop.current = event.target === ref.current;
  }

  // Nur ein echter Backdrop-Klick schliesst: gedrueckt UND losgelassen auf dem
  // Backdrop. Sonst wuerde eine Textmarkierung, die im Modal beginnt und
  // ausserhalb endet, das Modal faelschlich schliessen (click-target ist dann
  // der Dialog als gemeinsamer Vorfahr).
  function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === ref.current && pressedOnBackdrop.current) onClose();
  }

  return (
    <Dialog
      ref={ref}
      onCancel={onClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      aria-label={title}
    >
      <Header>
        <h2>{title}</h2>
        <CloseButton type="button" onClick={onClose} aria-label="Schliessen">
          &times;
        </CloseButton>
      </Header>
      <Body>{children}</Body>
    </Dialog>
  );
}

const Dialog = styled.dialog`
  /* margin: auto zentriert das <dialog> im Viewport (inset: 0 kommt vom
     Browser). Explizit noetig, weil der globale Reset (* { margin: 0 }) das
     UA-margin: auto ueberschreibt und das Modal sonst oben links klebt. */
  margin: auto;
  width: min(520px, calc(100vw - 2 * var(--space-4)));
  max-height: calc(100vh - 2 * var(--space-5));
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-3);

  /* display NUR im offenen Zustand setzen. Am Basis-Selektor (Klasse) wuerde
     display die UA-Regel dialog:not([open]) { display: none } aushebeln, sodass
     der Dialog geschlossen sichtbar bliebe. So bleibt das Ausblenden intakt. */
  &[open] {
    display: flex;
    flex-direction: column;
  }

  &::backdrop {
    background: var(--color-overlay);
    backdrop-filter: blur(2px);
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-5) var(--space-3);

  h2 {
    font-size: var(--text-lg);
  }
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
`;

const Body = styled.div`
  /* flex:1 + min-height:0 laesst den Body den Restplatz fuellen und bei
     langem Inhalt scrollen, statt den Dialog ueber max-height hinaus zu draengen. */
  flex: 1;
  min-height: 0;
  padding: 0 var(--space-5) var(--space-5);
  overflow-y: auto;
`;

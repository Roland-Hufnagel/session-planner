import styled, { css } from "styled-components";

type Variant = "primary" | "secondary" | "text" | "danger" | "danger-outline";
type Size = "sm" | "md";

type ButtonProps = {
  $variant?: Variant;
  $size?: Size;
  $fullWidth?: boolean;
};

const sizes: Record<Size, ReturnType<typeof css>> = {
  sm: css`
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    height: 34px;
  `,
  md: css`
    padding: var(--space-2) var(--space-5);
    font-size: var(--text-md);
    height: 42px;
  `,
};

const variants: Record<Variant, ReturnType<typeof css>> = {
  primary: css`
    background: var(--color-primary);
    color: var(--color-primary-contrast);
    box-shadow: var(--shadow-1);
    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
      box-shadow: var(--shadow-2);
    }
  `,
  secondary: css`
    background: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border-strong);
    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
      border-color: var(--color-text-muted);
    }
  `,
  text: css`
    background: transparent;
    color: var(--color-primary);
    &:hover:not(:disabled) {
      background: var(--color-primary-soft);
    }
  `,
  danger: css`
    background: var(--color-danger);
    color: #ffffff;
    box-shadow: var(--shadow-1);
    &:hover:not(:disabled) {
      background: var(--color-danger-hover);
      box-shadow: var(--shadow-2);
    }
  `,
  "danger-outline": css`
    background: transparent;
    color: var(--color-danger);
    border-color: var(--color-danger);
    &:hover:not(:disabled) {
      background: var(--color-danger-soft);
      border-color: var(--color-danger-hover);
      color: var(--color-danger-hover);
    }
  `,
};

/**
 * Button im MUI-Stil mit neuefische-Akzent.
 * Varianten: primary (gefuellt), secondary (outlined), text, danger.
 */
export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast), box-shadow var(--transition-fast),
    border-color var(--transition-fast), transform var(--transition-fast);
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};

  ${(props) => sizes[props.$size ?? "md"]}
  ${(props) => variants[props.$variant ?? "primary"]}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

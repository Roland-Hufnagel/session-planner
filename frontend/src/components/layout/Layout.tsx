import { type ReactNode } from "react";
import styled from "styled-components";
import { Header } from "./Header";

/** Grundgeruest: fixe Kopfzeile + zentrierter Inhaltsbereich. */
export function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
    </>
  );
}

const Main = styled.main`
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--space-5);
`;

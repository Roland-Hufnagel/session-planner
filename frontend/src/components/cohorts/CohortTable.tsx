import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FEDERAL_STATE_LABELS, type Cohort } from "../../types/cohort";
import { formatIsoDate } from "../../utils/date";
import { CohortColor } from "./CohortColor";
import { DepartmentBadge } from "./DepartmentBadge";

/** Nur-Lese-Uebersicht aller Cohorten. Ein Klick auf eine Zeile oeffnet die Detailseite. */
export function CohortTable({ cohorts }: Readonly<{ cohorts: Cohort[] }>) {
  const navigate = useNavigate();

  return (
    <Scroll>
      <Table>
        <thead>
          <tr>
            <Th>Cohort</Th>
            <Th>Department</Th>
            <Th>Period</Th>
            <Th>State</Th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <Row
              key={cohort.id}
              onClick={() => navigate(cohort.id)}
              // Als Link fuer Tastatur/Screenreader bedienbar machen.
              role="link"
              tabIndex={0}
              aria-label={`Details for ${cohort.name}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(cohort.id);
                }
              }}
            >
              <Td>
                <Identity>
                  <CohortColor colorCode={cohort.colorCode} />
                  <div>
                    <Name>{cohort.name}</Name>
                    {cohort.nickname && <Nickname>{cohort.nickname}</Nickname>}
                  </div>
                </Identity>
              </Td>
              <Td>
                <DepartmentBadge department={cohort.department} />
              </Td>
              <Td>
                <Muted>
                  {formatIsoDate(cohort.startDate)} – {formatIsoDate(cohort.endDate)}
                </Muted>
              </Td>
              <Td>
                {/* Die Bundesland-Namen bleiben bewusst deutsch (Eigennamen). */}
                <Muted lang="de">{FEDERAL_STATE_LABELS[cohort.federalState]}</Muted>
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

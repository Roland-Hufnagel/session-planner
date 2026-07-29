import {useNavigate} from "react-router-dom";

import {FEDERAL_STATE_LABELS, type Cohort} from "../../types/cohort";
import {formatIsoDate} from "../../utils/date";
import {CohortColor} from "./CohortColor";
import {DepartmentBadge} from "./DepartmentBadge";
import {Scroll, Table, Th, Row, Td, Identity, Name, Nickname, Muted} from "../ui/Table.ts";

/** Nur-Lese-Uebersicht aller Cohorten. Ein Klick auf eine Zeile oeffnet die Detailseite. */
export function CohortTable({cohorts}: Readonly<{ cohorts: Cohort[] }>) {
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
                                <CohortColor colorCode={cohort.colorCode}/>
                                <div>
                                    <Name>{cohort.name}</Name>
                                    {cohort.nickname && <Nickname>{cohort.nickname}</Nickname>}
                                </div>
                            </Identity>
                        </Td>
                        <Td>
                            <DepartmentBadge department={cohort.department}/>
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

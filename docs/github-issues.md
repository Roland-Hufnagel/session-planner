# Session Planner — GitHub Issues (MVP)

Copy-paste-fertige Issues. Vorgeschlagene **Labels**: `backend`, `frontend`, `infra`, `auth`, `mvp`, `post-mvp`.
Vorgeschlagene **Milestones**: `Woche 1`, `Woche 2`, `Woche 3`, `Woche 4`.
Konvention: „Blocked by" nennt Voraussetzungs-Issues.

---

## SP-1 · Projekt-Setup & Single-Deployable
**Labels:** `infra` `mvp` · **Milestone:** Woche 1 · **Schätzung:** ~2 T

**Kontext**
Grundgerüst des Monorepos mit getrennten `backend/`- und `frontend/`-Ordnern. Frontend wird bewusst **manuell** gebaut (kein Maven-Frontend-Plugin) und in die static-Resources des Backends gelegt, sodass ein JAR API + UI ausliefert.

**Tasks**
- [x] `backend/` (Spring Boot, Maven, Java) + `frontend/` (Vite + React + TS) anlegen
- [x] Package-Struktur nach Layer: `controller`, `service`, `repository`, `model`, `dto`, `config`, `security`
- [x] Vite-Dev-Proxy `/api` → `:8080`
- [x] Build-Doku: `npm run build` → Output nach `backend/src/main/resources/static/`

**Akzeptanzkriterien**
- [x] `mvn package` erzeugt ein JAR, das API **und** gebaute UI ausliefert
- [x] `npm run dev` läuft lokal gegen das Backend
- [x] README beschreibt den Build-Ablauf

---

## SP-2 · CI: Tests, SonarQube & Coverage
**Labels:** `infra` `mvp` · **Milestone:** Woche 1 · **Schätzung:** ~1 T · **Blocked by:** SP-1

**Kontext**
Qualitätssicherung ab dem ersten Commit — Pflicht-Tests + Sonar sind Projektvorgabe.

**Tasks**
- [x] GitHub-Action: Build + Test bei jedem Push/PR
- [x] JaCoCo-Coverage-Report generieren
- [x] SonarQube/SonarCloud-Analyse einbinden (Quality Gate)

**Akzeptanzkriterien**
- [x] Pipeline läuft grün bei Push/PR
- [x] Coverage-Report + Sonar-Analyse sichtbar
- [x] Quality Gate schlägt bei kritischen Findings an

---

## SP-3 · GitHub OAuth2 Login (Provisioning-by-githubName)
**Labels:** `backend` `auth` `mvp` · **Milestone:** Woche 1 · **Schätzung:** ~2,5 T · **Blocked by:** SP-1

**Kontext**
Login ausschließlich für vorab angelegte User. Ein Admin legt den User inkl. `githubName` an; der Login **matcht** einen bestehenden User über den GitHub-Login-Namen. Kein Auto-Upsert.

**Tasks**
- [ ] Spring Security OAuth2-Login über GitHub
- [ ] Custom `OAuth2UserService`: User per `githubName` suchen; **kein Match ⇒ Zugriff verweigert**
- [ ] `GET /api/auth/me` (aktueller User), Logout-Endpoint
- [ ] `/api/**` absichern (401 unauthentifiziert)
- [ ] CSRF via `CookieCsrfTokenRepository` + axios `withCredentials`/xsrf-Config
- [ ] Security-Tests (`spring-security-test`): bekannter vs. unbekannter `githubName`

**Akzeptanzkriterien**
- [ ] Bekannter GitHub-User wird eingeloggt, `/api/auth/me` liefert sein Profil
- [ ] Unbekannter GitHub-User wird abgelehnt (kein neuer User)
- [ ] Mutierende Requests funktionieren mit CSRF-Cookie

---

## SP-4 · User — Backend CRUD + Tests
**Labels:** `backend` `mvp` · **Milestone:** Woche 1 · **Schätzung:** ~1,5 T · **Blocked by:** SP-1

**Kontext**
Referenz-CRUD-Implementierung; Muster für Cohort und Shift. Hier wird erstmals die **Datenbank angebunden** (erste persistierte Entity).

**Tasks**
- [ ] Lokale PostgreSQL + `application.properties` (DB-URL, JPA-Settings via ENV)
- [ ] Entity `User` (`id: UUID`, `name`, `role` enum [MVP: ADMIN], `githubName` unique, optional email/avatar)
- [ ] Repository, Service, Controller, Request-/Response-DTOs (`record`)
- [ ] `GET /api/users`, `GET /api/users/{id}`, `POST`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`
- [ ] Bean-Validation; zentrales `@RestControllerAdvice` (404/400)
- [ ] Controller-Tests (MockMvc) + Service-Tests (Mockito)

**Akzeptanzkriterien**
- [ ] Alle CRUD-Endpunkte funktionieren und sind getestet
- [ ] Ungültige Eingaben → 400, unbekannte ID → 404
- [ ] `githubName`-Uniqueness durchgesetzt

---

## SP-5 · User — Frontend
**Labels:** `frontend` `mvp` · **Milestone:** Woche 1 · **Schätzung:** ~1,5 T · **Blocked by:** SP-4

**Kontext**
User-View inkl. des **wiederverwendbaren Formularmusters** (Create = Edit), das für alle Entitäten gilt.

**Tasks**
- [ ] Liste (Name, Rolle, GitHub-Name)
- [ ] Detail-Modal mit Edit + Delete
- [ ] **Ein** React-Hook-Form-Formular für Create + Edit (Edit vorbefüllt)
- [ ] SWR-Hook `useUsers`; zentrale axios-Instanz; `mutate()` nach Mutationen
- [ ] TypeScript-Types passend zu den Backend-DTOs

**Akzeptanzkriterien**
- [ ] User anlegen/bearbeiten/löschen im UI, Liste aktualisiert sich
- [ ] Dieselbe Formular-Komponente für Create und Edit

---

## SP-6 · Cohort — Backend CRUD + Tests
**Labels:** `backend` `mvp` · **Milestone:** Woche 2 · **Schätzung:** ~1 T · **Blocked by:** SP-4

**Tasks**
- [ ] Entity `Cohort` (`name`, `startDate`, `endDate`, `federalState` enum, `courseName`)
- [ ] Repo/Service/Controller/DTOs nach User-Muster; `/api/cohorts` CRUD
- [ ] `federalState` als Bundesland-Enum
- [ ] Controller- + Service-Tests

**Akzeptanzkriterien**
- [ ] CRUD funktioniert und ist getestet
- [ ] Datums-/Enum-Validierung greift

---

## SP-7 · Cohort — Frontend
**Labels:** `frontend` `mvp` · **Milestone:** Woche 2 · **Schätzung:** ~1 T · **Blocked by:** SP-5, SP-6

**Tasks**
- [ ] Liste + Detail-Modal + wiederverwendbares Formular
- [ ] Datumsfelder + Bundesland-Dropdown
- [ ] SWR-Hook `useCohorts`

**Akzeptanzkriterien**
- [ ] Cohorten im UI vollständig verwaltbar

---

## SP-8 · Shift — Backend CRUD, Range-Query & Assign
**Labels:** `backend` `mvp` · **Milestone:** Woche 2 · **Schätzung:** ~2 T · **Blocked by:** SP-6

**Kontext**
Shift-API inkl. der beiden für die Schedule-View nötigen Zusatz-Endpunkte.

**Tasks**
- [ ] Entity `Shift` (`date`, `startTime`, `endTime`, `title`, `cohort` @ManyToOne, `coach` @ManyToOne nullable)
- [ ] CRUD; Relationen als IDs in Requests, eingebettet in Responses
- [ ] `GET /api/shifts?from=&to=` (Wochen-Range)
- [ ] `PUT /api/shifts/{id}/coach` — Body `{ coachId | null }` (null = Unassign)
- [ ] Zeit-Validierung (`startTime < endTime`); Tests inkl. Assign + Unassign

**Akzeptanzkriterien**
- [ ] CRUD, Range-Query und Assign/Unassign funktionieren und sind getestet
- [ ] Ungültige Zeiten/Referenzen → 400/404

---

## SP-9 · Shift — Frontend
**Labels:** `frontend` `mvp` · **Milestone:** Woche 2 · **Schätzung:** ~1,5 T · **Blocked by:** SP-7, SP-8

**Tasks**
- [ ] Liste (Datum, von/bis, Titel, Cohort, Coach)
- [ ] Detail-Modal + wiederverwendbares Formular
- [ ] Cohort-Dropdown + Coach-Dropdown (Coach default „–/null")
- [ ] SWR-Hook `useShifts`

**Akzeptanzkriterien**
- [ ] Shifts im UI vollständig verwaltbar, Cohort/Coach auswählbar

---

## SP-10 · Schedule-View (Hauptfeature)
**Labels:** `frontend` `mvp` · **Milestone:** Woche 3 · **Schätzung:** ~2,5 T · **Blocked by:** SP-8, SP-9

**Kontext**
Wochen-Raster (Mo–Fr) mit „Unassigned"-Spur und je User einer Coach-Spur; Zuweisung per Dropdown.

**Tasks**
- [ ] Wochen-Picker (Mo–Fr); Range → `GET /api/shifts?from=&to=` + `GET /api/users`
- [ ] Raster: „Unassigned"-Spur oben, darunter je User eine Spur
- [ ] Client-seitiges Grouping der Shifts nach Coach
- [ ] Coach-Dropdown auf der Shift-Karte ⇒ `PUT .../coach` (inkl. Unassign) + `mutate()`

**Akzeptanzkriterien**
- [ ] Woche wechselbar, Shifts erscheinen im richtigen Tag/Spur
- [ ] Zuweisen verschiebt die Karte live von „Unassigned" in die Coach-Spur (und zurück)

---

## SP-11 · CD & Deployment (Docker → Docker Hub → Render)
**Labels:** `infra` `mvp` · **Milestone:** Woche 1 (aufsetzen) / Woche 4 (härten) · **Schätzung:** ~1,5 T · **Blocked by:** SP-1

**Kontext**
Automatisiertes Deployment; ideal früh in Woche 1 aufgesetzt, in Woche 4 gehärtet.

**Tasks**
- [ ] Multi-Stage-`Dockerfile`: `mvn package` → schlankes JRE-Runtime-Image
- [ ] GitHub Action: Image bauen → **Docker Hub** pushen → **Render**-Deploy-Hook triggern
- [ ] Render: **Web Service** (Docker-Image) + managed **PostgreSQL** provisionieren
- [ ] Secrets/Env: OAuth-Client, DB-URL, Docker-Hub-Token, Render-Deploy-Hook
- [ ] End-to-End-Smoke: Login → CRUD → Schedule-Zuweisung auf der deployten App

**Akzeptanzkriterien**
- [ ] Push auf `main` aktualisiert das Docker-Hub-Image und deployt automatisch auf Render
- [ ] Deployte App voll funktionsfähig, keine kritischen Sonar-Findings

---

# Post-MVP (Backlog)

## POST-A · CSV-Import inkl. Feiertage (Flaggschiff)
**Labels:** `backend` `post-mvp` · **Schätzung:** ~3–4 T
- [ ] CSV je Kurs importieren → Shifts einer Cohorte automatisch anlegen
- [ ] Bundeslandspezifische Feiertage via **Nager.Date-API** ausklammern
- [ ] Import-Validierung + Fehlerbericht; Tests (inkl. gemockte externe API)

## POST-B · Off-Times
**Labels:** `backend` `frontend` `post-mvp` · **Schätzung:** ~2 T
- [ ] Off-Times als spezielle Shifts, die eine Coach-Zuweisung in dem Zeitraum blockieren

## POST-C · Rollen-Management
**Labels:** `backend` `frontend` `post-mvp` · **Schätzung:** ~2 T
- [ ] Rollen jenseits von ADMIN; Coach-Lanes im Schedule rollengefiltert

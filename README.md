# Session Planner

Coaching-Tool zum Planen von Bootcamp-**Cohorten** und deren **Shifts** und zum
Zuweisen von **Coaches** zu einzelnen Shifts. Kernstück ist eine Wochen-Ansicht
(Schedule), in der Shifts per Drag-freiem Dropdown einem Coach zugewiesen werden.

> Status: MVP in Entwicklung. Die Tickets liegen in [`docs/github-issues.md`](docs/github-issues.md).

## Tech-Stack

| Bereich   | Technologie                                             |
| --------- | ------------------------------------------------------- |
| Backend   | Java 25, Spring Boot 4.1, Maven, Spring Data JPA        |
| Datenbank | PostgreSQL                                              |
| Frontend  | React 19, TypeScript, Vite 8                            |
| Auth      | GitHub OAuth2 (Login nur für vorab angelegte User)      |
| Deployment| Docker → Docker Hub → Render (Single-Deployable JAR)    |

## Projektstruktur

Monorepo mit getrennten `backend/`- und `frontend/`-Ordnern. Das Frontend wird
**manuell** gebaut und in die static-Resources des Backends gelegt, sodass **ein
JAR API und UI zusammen ausliefert** (Single-Deployable).

```
session-planner/
├── backend/                 # Spring Boot (Maven)
│   └── src/main/java/org/example/backend/
│       ├── controller/      # REST-Controller
│       ├── service/         # Business-Logik
│       ├── repository/      # Spring-Data-JPA-Repositories
│       ├── model/           # JPA-Entities (User, Cohort, Shift)
│       ├── dto/             # Request-/Response-Records
│       ├── security/        # OAuth2-Login, Security-Config
│       └── config/          # Querschnitt (CORS, Exception-Handler)
├── frontend/                # Vite + React + TypeScript
└── docs/                    # Projekt-Doku & Tickets
```

Das Backend ist **package-by-layer** organisiert (Schichten als Packages).

## Voraussetzungen

- **JDK 25**
- **Node.js** ≥ 20.19 (Vite 8)
- **PostgreSQL** (lokal laufend)
- **Maven** (oder der mitgelieferte `./mvnw`-Wrapper)

## Lokale Entwicklung

Backend und Frontend laufen im Dev-Modus **getrennt**. Der Vite-Dev-Server liefert
das Frontend mit Hot-Reload aus und proxyt API-Calls ans Backend.

**1. Backend starten** (Port `8080`):

```bash
cd backend
./mvnw spring-boot:run
```

**2. Frontend-Dev-Server starten** (Port `5173`):

```bash
cd frontend
npm install      # einmalig
npm run dev
```

Aufrufe von `/api/**` werden per Vite-Proxy an das Backend auf `:8080`
weitergereicht — im Dev also über `http://localhost:5173`.

## Production-Build (Single-Deployable JAR)

Das Frontend wird gebaut und **in die static-Resources des Backends** geschrieben,
danach paketiert Maven alles in ein ausführbares JAR.

**1. Frontend bauen** → Output nach `backend/src/main/resources/static/`:

```bash
cd frontend
npm run build
```

**2. Backend paketieren** (bündelt die gebaute UI ins JAR):

```bash
cd backend
./mvnw package
```

**3. JAR starten** — API und UI laufen jetzt gemeinsam auf `:8080`:

```bash
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

> Der Frontend-Build ist bewusst ein **eigener, manueller Schritt** (kein
> Maven-Frontend-Plugin). Reproduzierbar wird der Gesamt-Build über das
> Multi-Stage-`Dockerfile` (siehe Ticket SP-11).

## Konfiguration

Konfiguration erfolgt über `application.properties` bzw. Umgebungsvariablen
(DB-URL, JPA-Settings, OAuth2-Client). *Konkrete Variablen werden im Zuge von
SP-1 / SP-3 ergänzt.*

## Tests

```bash
cd backend
./mvnw test
```

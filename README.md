# ASKEL — Tehtävienhallintasovellus

Web-sovellus tiimien, projektien, sprinttien ja tehtävien (tikettien) hallintaan.
Tekniikat: **React (Vite)** + **Node.js/Express** + **SQLite (better-sqlite3)**.

*VAATII 22.X version tai vastaavan. Uudemmat 23.X ja 24.X eivät toimi*
---

## 1. Käynnistys

### Backend
```bash
cd backend
npm install
npm run seed     # täyttää tietokannan esimerkkidatalla (ajetaan kerran)
npm start        # käynnistää palvelimen osoitteeseen http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # käynnistää sovelluksen osoitteeseen http://localhost:5173
```

Avaa selaimessa `http://localhost:5173`. Sovellus hakee datan backendin REST-rajapinnasta.

---

## 2. Sovelluksen keskeiset toiminnot

- Tikettitaulu (Kanban): backlog → tehtävä → työn alla → katselmoinnissa → valmis
- Tikettien luonti, muokkaus, tilan vaihto raahaamalla, poisto
- Sprinttien mukainen suodatus (Scrum-työskentely)
- Vastuuhenkilön ja raportoijan osoittaminen tiketille
- Kommentointi tiketteihin
- Tiimin jäsenet ja roolit (admin / jäsen)
- Tietokanta säilyy tiedostona (`backend/src/db/tehtavienhallinta.db`), data pysyy uudelleenkäynnistysten yli

---

## 3. Tietokannan suunnittelu

### 3.1 Mitä tietoa sovellus käsittelee

Sovellus mallintaa tyypillistä Scrum-tiimin työskentelyä:

| Käsiteltävä tieto | Kuvaus |
|---|---|
| Käyttäjät | Sovelluksen käyttäjät, jotka voivat olla tiimin jäseniä, tikettien raportoijia tai vastuuhenkilöitä |
| Tiimit | Kokonaisuus, jolle projektit kuuluvat |
| Tiimin jäsenyys | Kuka kuuluu mihin tiimiin ja millä roolilla |
| Projektit | Tiimin toteuttama kokonaisuus (tässä: itse sovellusprojekti) |
| Sprintit | Ajallisesti rajatut työjaksot projektin sisällä |
| Tehtävät / tiketit | Yksittäiset työtehtävät, joilla on tila, prioriteetti ja vastuuhenkilö |
| Kommentit | Tiketteihin liittyvä keskustelu |
| Liitteet | Tiketteihin liitetyt tiedostot |

### 3.2 Miten tieto on jaettu rakenteisiin

Tieto on normalisoitu kahdeksaan tauluun sen mukaan, mikä tieto toistuu ja mikä on yksilöllistä:

- **users** — käyttäjätiedot ovat oma taulu, koska samaa käyttäjää käytetään useassa roolissa (tiimin jäsen, vastuuhenkilö, raportoija, kommentoija)
- **teams / team_members** — jäsenyys eriytetty omaksi väliliitostauluksi, koska yhdellä käyttäjällä voi olla useita tiimejä ja yhdellä tiimillä useita jäseniä (many-to-many)
- **projects** — kuuluu yhteen tiimiin (one-to-many teams → projects)
- **sprints** — kuuluu yhteen projektiin, kuvaa Scrum-sprintin aikataulun ja tilan
- **tasks** — sovelluksen ydin: kuuluu projektiin, voi kuulua sprinttiin, viittaa kahteen eri käyttäjään (assignee, reporter)
- **comments / attachments** — riippuvat aina yhdestä tiketistä ja yhdestä käyttäjästä

### 3.3 Taulujen ja kenttien määrittely, tietotyypit

Katso täydellinen skeema: [`backend/src/db/schema.sql`](backend/src/db/schema.sql). Yhteenveto:

| Taulu | Keskeiset kentät | Tietotyypit |
|---|---|---|
| users | id, name, email (UNIQUE), password_hash, created_at | INTEGER, TEXT, TEXT, TEXT, DATETIME |
| teams | id, name, description | INTEGER, TEXT, TEXT |
| team_members | id, team_id, user_id, role, joined_at | INTEGER, INTEGER, INTEGER, TEXT (CHECK), DATETIME |
| projects | id, team_id, name, description | INTEGER, INTEGER, TEXT, TEXT |
| sprints | id, project_id, name, start_date, end_date, status | INTEGER, INTEGER, TEXT, DATE, DATE, TEXT (CHECK) |
| tasks | id, project_id, sprint_id, title, description, status, priority, assignee_id, reporter_id, due_date | INTEGER × 5, TEXT × 4, DATE |
| comments | id, task_id, user_id, content, created_at | INTEGER × 3, TEXT, DATETIME |
| attachments | id, task_id, file_name, file_path, uploaded_by, uploaded_at | INTEGER × 3, TEXT × 2, DATETIME |

`status` ja `priority` -kentät on rajattu `CHECK`-ehdoilla sallittuihin arvoihin (esim. tila: `backlog / todo / in_progress / review / done`), mikä varmistaa datan eheyden sovelluslogiikan tasolla myös tietokannassa.

### 3.4 Avaimet ja viittaukset

- Kaikilla tauluilla on **pääavain** `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)
- **Vierasavaimet (FK)**:
  - `team_members.team_id → teams.id`, `team_members.user_id → users.id`
  - `projects.team_id → teams.id`
  - `sprints.project_id → projects.id`
  - `tasks.project_id → projects.id`, `tasks.sprint_id → sprints.id`, `tasks.assignee_id → users.id`, `tasks.reporter_id → users.id`
  - `comments.task_id → tasks.id`, `comments.user_id → users.id`
  - `attachments.task_id → tasks.id`, `attachments.uploaded_by → users.id`
- **ON DELETE CASCADE** useimmissa viittauksissa (esim. tiimin poisto poistaa jäsenyydet), **ON DELETE SET NULL** siellä missä tieto voi jäädä orvoksi ilman ongelmaa (esim. tiketin vastuuhenkilö voidaan poistaa ilman että tiketti katoaa)
- `team_members` on **many-to-many-liitostaulu** users ↔ teams -väliin, joka mahdollistaa saman käyttäjän kuulumisen useisiin tiimeihin ja tiimin useisiin jäseniin

ER-malli (esitetty erikseen kaaviona) vastaa suoraan tätä rakennetta.

---

## 4. Projektirakenne

```
tehtavienhallinta/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql       ← tietokannan rakenne
│   │   │   ├── seed.js          ← esimerkkidata
│   │   │   └── index.js
│   │   ├── routes/               ← REST-rajapinnat (users, teams, projects, sprints, tasks)
│   │   └── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx                ← Kanban-taulu + sprinttinavigaatio
    │   ├── TaskModal.jsx          ← tiketin tarkastelu, muokkaus, kommentit
    │   ├── NewTaskForm.jsx        ← uuden tiketin luonti
    │   └── api.js                 ← yhteys backendiin
    └── package.json
```

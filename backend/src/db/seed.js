const db = require('./index');

// Tyhjennä taulut (kehitystä varten - suoritusjärjestys FK:iden takia)
db.exec(`
  DELETE FROM attachments;
  DELETE FROM comments;
  DELETE FROM tasks;
  DELETE FROM sprints;
  DELETE FROM projects;
  DELETE FROM team_members;
  DELETE FROM teams;
  DELETE FROM users;
`);

const insertUser = db.prepare(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`);
const u1 = insertUser.run('Maija Meikäläinen', 'maija@example.com', 'demo-hash-1').lastInsertRowid;
const u2 = insertUser.run('Jussi Virtanen', 'jussi@example.com', 'demo-hash-2').lastInsertRowid;
const u3 = insertUser.run('Anna Korhonen', 'anna@example.com', 'demo-hash-3').lastInsertRowid;
const u4 = insertUser.run('Pekka Nieminen', 'pekka@example.com', 'demo-hash-4').lastInsertRowid;

const insertTeam = db.prepare(`INSERT INTO teams (name, description) VALUES (?, ?)`);
const t1 = insertTeam.run('Kehitystiimi Alpha', 'Sovelluskehityksestä vastaava tiimi').lastInsertRowid;

const insertMember = db.prepare(`INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)`);
insertMember.run(t1, u1, 'admin');
insertMember.run(t1, u2, 'jasen');
insertMember.run(t1, u3, 'jasen');
insertMember.run(t1, u4, 'jasen');

const insertProject = db.prepare(`INSERT INTO projects (team_id, name, description) VALUES (?, ?, ?)`);
const p1 = insertProject.run(t1, 'Tehtävienhallintasovellus', 'Koulutusprojektin päätuote').lastInsertRowid;

const insertSprint = db.prepare(`INSERT INTO sprints (project_id, name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)`);
const s1 = insertSprint.run(p1, 'Sprintti 1 - Perusrakenne', '2026-06-01', '2026-06-14', 'valmis').lastInsertRowid;
const s2 = insertSprint.run(p1, 'Sprintti 2 - Tiketit ja kommentit', '2026-06-15', '2026-06-28', 'valmis').lastInsertRowid;
const s3 = insertSprint.run(p1, 'Sprintti 3 - Viimeistely ja demo', '2026-06-29', '2026-07-12', 'kaynnissa').lastInsertRowid;

const insertTask = db.prepare(`
  INSERT INTO tasks (project_id, sprint_id, title, description, status, priority, assignee_id, reporter_id, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const task1 = insertTask.run(p1, s1, 'Tietokantaskeeman suunnittelu', 'Suunnitellaan taulut ja relaatiot', 'done', 'high', u2, u1, '2026-06-05').lastInsertRowid;
const task2 = insertTask.run(p1, s1, 'Backend-rungon pystytys', 'Express-palvelin ja perusreitit', 'done', 'high', u3, u1, '2026-06-10').lastInsertRowid;
const task3 = insertTask.run(p1, s2, 'Tikettien CRUD-toiminnot', 'Luo, listaa, päivitä, poista tehtäviä', 'done', 'high', u2, u1, '2026-06-20').lastInsertRowid;
const task4 = insertTask.run(p1, s2, 'Kommenttiominaisuus', 'Käyttäjät voivat kommentoida tikettejä', 'in_progress', 'medium', u4, u1, '2026-06-27').lastInsertRowid;
const task5 = insertTask.run(p1, s3, 'React-käyttöliittymän viimeistely', 'Tikettitaulun ja lomakkeiden tyylittely', 'in_progress', 'medium', u3, u1, '2026-07-08').lastInsertRowid;
const task6 = insertTask.run(p1, s3, 'ER-mallin dokumentointi', 'Piirretään ja tarkistetaan ER-malli', 'todo', 'medium', u1, u1, '2026-07-10').lastInsertRowid;
const task7 = insertTask.run(p1, s3, 'Esityksen kokoaminen', 'Scrum- ja tikettiesityksen kokoaminen', 'backlog', 'high', u1, u1, '2026-07-12').lastInsertRowid;
const task8 = insertTask.run(p1, null, 'Liitteiden lataus tiketteihin', 'Mahdollisuus liittää tiedostoja tehtäviin', 'backlog', 'low', null, u1, null).lastInsertRowid;

const insertComment = db.prepare(`INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)`);
insertComment.run(task3, u2, 'CRUD-reitit valmiina, testattu Postmanilla.');
insertComment.run(task4, u4, 'Kommenttien tallennus toimii, UI kesken.');
insertComment.run(task4, u1, 'Muista lisätä aikaleima kommentteihin.');
insertComment.run(task5, u3, 'Tikettitaulun drag&drop puuttuu vielä.');

console.log('Esimerkkidata lisätty onnistuneesti.');
console.log({ käyttäjät: 4, tiimi: 1, projekti: 1, sprintit: 3, tehtävät: 8, kommentit: 4 });

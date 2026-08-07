const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const teamsRouter = require('./routes/teams');
const projectsRouter = require('./routes/projects');
const sprintsRouter = require('./routes/sprints');
const tasksRouter = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/sprints', sprintsRouter);
app.use('/api/tasks', tasksRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend käynnissä osoitteessa http://localhost:${PORT}`);
});

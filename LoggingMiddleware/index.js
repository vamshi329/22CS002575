const express = require('express');
const { Log, loggingMiddleware } = require('./logger');

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(loggingMiddleware);


app.get('/', async (req, res) => {
  await Log("backend", "info", "handler", "Home route accessed");
  res.json({ message: "Logging middeleware working!" });
});

app.get('/test', async (req, res) => {
  await Log("backend", "info", "controller", "Test endpoint called");
  res.json({ status: "success" });
});

app.listen(PORT, async () => {
  await Log("backend", "info", "service", "Server started successfully");
  console.log(`Server runnig at http://localhost:${PORT}`);
});

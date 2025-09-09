const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { Log } = require('../LoggingMiddleware/logger');

const app = express();
const PORT = 3003;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());

// Initialize data file
async function initializeDataFile() {
  try {
    await Log("backend", "info", "service", "Initializing data file");
    await fs.access(DATA_FILE);
    await Log("backend", "debug", "db", "Data file exists");
  } catch {
    await Log("backend", "info", "db", "Creating new data file");
    await fs.writeFile(DATA_FILE, JSON.stringify({ records: [] }));
  }
}

// Read data from file
async function readData() {
  try {
    await Log("backend", "debug", "db", "Reading data from file");
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    await Log("backend", "error", "db", `Failed to read data: ${error.message}`);
    throw error;
  }
}

// Write data to file
async function writeData(data) {
  try {
    await Log("backend", "debug", "db", "Writing data to file");
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    await Log("backend", "info", "db", "Data written successfully");
  } catch (error) {
    await Log("backend", "error", "db", `Failed to write data: ${error.message}`);
    throw error;
  }
}

// GET /api/records - Get all records
app.get('/api/records', async (req, res) => {
  try {
    await Log("backend", "info", "handler", "GET records endpoint called");
    const data = await readData();
    
    await Log("backend", "info", "service", `Retrieved ${data.records.length} records`);
    res.json({ success: true, records: data.records });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Get records error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/records - Create new record
app.post('/api/records', async (req, res) => {
  try {
    await Log("backend", "info", "handler", "POST create record endpoint called");
    
    const { name, value, category } = req.body;
    
    if (!name || !value) {
      await Log("backend", "warn", "controller", "Invalid record data provided");
      return res.status(400).json({ success: false, error: "Name and value required" });
    }
    
    const data = await readData();
    const newRecord = {
      id: Date.now(),
      name,
      value,
      category: category || "general",
      createdAt: new Date().toISOString()
    };
    
    data.records.push(newRecord);
    await writeData(data);
    
    await Log("backend", "info", "service", `Record created: ${newRecord.name}`);
    res.status(201).json({ success: true, record: newRecord });
    
  } catch (error) {
    await Log("backend", "fatal", "service", `Critical error creating record: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/records/:id - Delete record
app.delete('/api/records/:id', async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    await Log("backend", "info", "handler", `DELETE record ${recordId} endpoint called`);
    
    const data = await readData();
    const recordIndex = data.records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      await Log("backend", "warn", "controller", `Record not found: ${recordId}`);
      return res.status(404).json({ success: false, error: "Record not found" });
    }
    
    const deletedRecord = data.records.splice(recordIndex, 1)[0];
    await writeData(data);
    
    await Log("backend", "info", "service", `Record deleted: ${deletedRecord.name}`);
    res.json({ success: true, message: "Record deleted", record: deletedRecord });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Delete record error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize and start server
initializeDataFile().then(() => {
  app.listen(PORT, async () => {
    await Log("backend", "info", "service", `Data Storage API started on port ${PORT}`);
    console.log(`Data Storage API running on http://localhost:${PORT}`);
  });
});

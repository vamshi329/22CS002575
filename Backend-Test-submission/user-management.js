const express = require('express');
const { Log } = require('../LoggingMiddleware/logger');

const app = express();
const PORT = 3001;

app.use(express.json());

let usersData = [
  { id: 1, name: "Hi", email: "hi@gmail.com", active: true },
  { id: 2, name: "Hello", email: "hello@gmail.com", active: false }
];


app.get('/api/users', async (req, res) => {
  try {
    await Log("backend", "info", "handler", "GET users endpoint called");
    await Log("backend", "debug", "service", "Retrieving users from storage");
    
    const activeUsers = usersData.filter(user => user.active);
    
    await Log("backend", "info", "service", `Retrieved ${activeUsers.length} active users`);
    res.json({ 
      success: true, 
      count: activeUsers.length,
      users: activeUsers 
    });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Get users error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    await Log("backend", "info", "handler", "POST create user endpoint called");
    
    const { name, email } = req.body;
    
    if (!name || !email) {
      await Log("backend", "warn", "controller", "Invalid user data provided");
      return res.status(400).json({ success: false, error: "Name and email required" });
    }
    
    await Log("backend", "debug", "controller", `Creating user: ${name}`);
    
    const newUser = {
      id: usersData.length + 1,
      name,
      email,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    await Log("backend", "info", "service", `User created successfully: ID ${newUser.id}`);
    res.status(201).json({ success: true, user: newUser });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Create user error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await Log("backend", "info", "handler", `PUT update user ${userId} endpoint called`);
    
    const userIndex = usersData.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      await Log("backend", "warn", "controller", `User not found: ${userId}`);
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    const { name, email, active } = req.body;
    await Log("backend", "debug", "controller", `Updating user ${userId} with new data`);
    
    usersData[userIndex] = { ...usersData[userIndex], name, email, active, updatedAt: new Date().toISOString() };
    
    await Log("backend", "info", "service", `User ${userId} updated successfully`);
    res.json({ success: true, user: usersData[userIndex] });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Update user error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await Log("backend", "info", "handler", `DELETE user ${userId} endpoint called`);
    
    const userIndex = usersData.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      await Log("backend", "warn", "controller", `User not found for deletion: ${userId}`);
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    await Log("backend", "debug", "controller", `Deleting user ${userId}`);
    usersData.splice(userIndex, 1);
    
    await Log("backend", "info", "service", `User ${userId} deleted successfully`);
    res.json({ success: true, message: "User deleted" });
    
  } catch (error) {
    await Log("backend", "fatal", "handler", `Delete user critical error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, async () => {
  await Log("backend", "info", "service", `User Management API started on port ${PORT}`);
  console.log(`User Management API running on http://localhost:${PORT}`);
});

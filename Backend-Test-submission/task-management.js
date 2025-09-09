const express = require('express');
const { Log } = require('../LoggingMiddleware/logger');

const app = express();
const PORT = 3002;

app.use(express.json());


let tasks = [
  { id: 1, title: "Complete project", description: "Finish the backend API", status: "pending", priority: "high" },
  { id: 2, title: "Code review", description: "Review team member's code", status: "completed", priority: "medium" }
];

app.get('/api/tasks', async (req, res) => {
  try {
    await Log("backend", "info", "handler", "GET tasks endpoint accessed");
    
    const { status, priority } = req.query;
    let filteredTasks = tasks;
    
    if (status) {
      await Log("backend", "debug", "controller", `Filtering tasks by status: ${status}`);
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (priority) {
      await Log("backend", "debug", "controller", `Filtering tasks by priority: ${priority}`);
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    await Log("backend", "info", "service", `Retrieved ${filteredTasks.length} tasks`);
    res.json({
      success: true,
      count: filteredTasks.length,
      tasks: filteredTasks
    });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Get tasks error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post('/api/tasks', async (req, res) => {
  try {
    await Log("backend", "info", "handler", "POST create task endpoint called");
    
    const { title, description, priority = "medium" } = req.body;
    
    if (!title || !description) {
      await Log("backend", "warn", "controller", "Invalid task data - missing title or description");
      return res.status(400).json({ success: false, error: "Title and description required" });
    }
    
    await Log("backend", "debug", "controller", `Creating task: ${title}`);
    
    const newTask = {
      id: tasks.length + 1,
      title,
      description,
      status: "pending",
      priority,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    
    await Log("backend", "info", "service", `Task created successfully: ${newTask.title}`);
    res.status(201).json({ success: true, task: newTask });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Create task error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.put('/api/tasks/:id/status', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    
    await Log("backend", "info", "handler", `PUT update task ${taskId} status endpoint called`);
    
    const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      await Log("backend", "warn", "controller", `Invalid status provided: ${status}`);
      return res.status(400).json({ success: false, error: "Invalid status" });
    }
    
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      await Log("backend", "warn", "controller", `Task not found: ${taskId}`);
      return res.status(404).json({ success: false, error: "Task not found" });
    }
    
    await Log("backend", "debug", "controller", `Updating task ${taskId} status to ${status}`);
    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    await Log("backend", "info", "service", `Task ${taskId} status updated to ${status}`);
    res.json({ success: true, task: tasks[taskIndex] });
    
  } catch (error) {
    await Log("backend", "error", "handler", `Update task status error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/tasks/stats', async (req, res) => {
  try {
    await Log("backend", "info", "handler", "GET task statistics endpoint called");
    await Log("backend", "debug", "service", "Calculating task statistics");
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in-progress").length,
      completed: tasks.filter(t => t.status === "completed").length,
      cancelled: tasks.filter(t => t.status === "cancelled").length,
      byPriority: {
        high: tasks.filter(t => t.priority === "high").length,
        medium: tasks.filter(t => t.priority === "medium").length,
        low: tasks.filter(t => t.priority === "low").length
      }
    };
    
    await Log("backend", "info", "service", "Task statistics calculated successfully");
    res.json({ success: true, stats });
    
  } catch (error) {
    await Log("backend", "fatal", "service", `Task stats calculation failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, async () => {
  await Log("backend", "info", "service", `Task Management API started on port ${PORT}`);
  console.log(`Task Management API running on http://localhost:${PORT}`);
});

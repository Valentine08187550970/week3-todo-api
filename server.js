require('dotenv').config();

const express = require('express');

const app = express();
const PORT = process.env.PORT || 7000;

// Read JSON request bodies
app.use(express.json());

// Store tasks in memory
let tasks = [];
let nextId = 1;

// 1. GET all tasks
app.get('/tasks', (req, res) => {
    let result = tasks;

    if (req.query.active === 'true') {
        result = tasks.filter(task => task.completed === false);
    }

    res.json(result);
});

// 2. POST a new task
app.post('/tasks', (req, res) => {
    const { task } = req.body;

    if (typeof task !== 'string' || !task.trim()) {
        return res.status(400).json({
            error: 'The task field is required.'
        });
    }

    const newTask = {
        id: nextId++,
        task: task.trim(),
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json({
        message: 'Task created successfully.',
        data: newTask
    });
});

// 3. GET a single task by ID
app.get('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID.'
        });
    }

    const task = tasks.find(item => item.id === id);

    if (!task) {
        return res.status(404).json({
            error: 'Task not found.'
        });
    }

    res.json(task);
});

// 4. PUT - Update a task
app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const { task, completed } = req.body;

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID.'
        });
    }

    const existingTask = tasks.find(item => item.id === id);

    if (!existingTask) {
        return res.status(404).json({
            error: 'Task not found.'
        });
    }

    if (
        task !== undefined &&
        (typeof task !== 'string' || !task.trim())
    ) {
        return res.status(400).json({
            error: 'Task must be a non-empty string.'
        });
    }

    if (
        completed !== undefined &&
        typeof completed !== 'boolean'
    ) {
        return res.status(400).json({
            error: 'Completed must be true or false.'
        });
    }

    if (task !== undefined) {
        existingTask.task = task.trim();
    }

    if (completed !== undefined) {
        existingTask.completed = completed;
    }

    res.json({
        message: 'Task updated successfully.',
        data: existingTask
    });
});

// 5. DELETE a task
app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: 'Invalid task ID.'
        });
    }

    const index = tasks.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Task not found.'
        });
    }

    const deletedTask = tasks.splice(index, 1)[0];

    res.json({
        message: 'Task deleted successfully.',
        data: deletedTask
    });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON format.'
        });
    }

    next(err);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Todo API running at http://localhost:${PORT}`);
});
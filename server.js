const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000
});

app.use('/api/', limiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-study-scheduler.herokuapp.com' 
    : 'http://localhost:3001'
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://root:example@db:27017/scheduler?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  console.log('Server is ready to accept connections');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Server cannot start without database connection');
  process.exit(1);
});

// Define schemas
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  category: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', TaskSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', [
  body('title').notEmpty().trim().escape(),
  body('description').trim().escape(),
  body('dueDate').isISO8601(),
  body('priority').isIn(['low', 'medium', 'high']),
  body('category').isIn(['homework', 'notes', 'project', 'exam'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Export for testing
module.exports = app;

// Move this to a separate file (bin/www.js)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
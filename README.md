# Study Scheduler

A modern task management application designed specifically for students, featuring an intuitive interface and motivational elements.

## Features
- 📚 Task Categories (Homework, Notes, Projects, Exams)
- 🎯 Priority Levels (High, Medium, Low)
- 📅 Due Date Tracking
- ✨ Completion Celebrations with Confetti
- 💡 Daily Motivational Quotes
- 📱 Responsive Design

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Containerization: Docker & Docker Compose

## Local Development Setup
1. Clone the repository:
```bash
git clone https://github.com/Ryheembon/study-scheduler.git
cd study-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Start with Docker:
```bash
docker-compose up --build
```

4. Access the application at `http://localhost:3001`

## Features Overview
- **Task Management**: Create, update, and delete tasks
- **Priority System**: Color-coded priority levels
- **Category Organization**: Organize tasks by type
- **Motivational Quotes**: Daily inspiration for productivity
- **Celebration Effects**: Confetti animation for completed tasks

## Docker Configuration
- Web application runs on port 3001
- MongoDB database included in Docker setup
- Automatic container health checks
- Volume persistence for database data

## Security Note
For production deployment:
- Change all default credentials
- Set up proper environment variables
- Use secure database configuration
- Enable HTTPS
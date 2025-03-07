document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Initial quote
    fetchQuote();
    
    // Add click event listener to quote button
    const quoteBtn = document.getElementById('newQuote');
    if (quoteBtn) {
        quoteBtn.addEventListener('click', fetchQuote);
    }
    
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const task = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            dueDate: document.getElementById('dueDate').value,
            category: document.getElementById('category').value,
            priority: document.getElementById('priority').value
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });

            if (response.ok) {
                loadTasks();
                e.target.reset();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.task-form').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.priority}-priority ${task.status}`;
    
    const dueDate = new Date(task.dueDate).toLocaleDateString();
    const categoryIcons = {
        homework: '📚',
        notes: '��',
        project: '🎯',
        exam: '📖'
    };
    
    div.innerHTML = `
        <div class="category-icon">${categoryIcons[task.category]}</div>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <div class="task-meta">
            <span>📅 Due: ${dueDate}</span>
            <span>📚 ${task.category}</span>
            <span>🎯 ${task.priority} priority</span>
            <span>📊 ${task.status}</span>
        </div>
        <div class="task-actions">
            <button onclick="deleteTask('${task._id}')" class="delete-btn">
                🗑️ Delete
            </button>
            <button onclick="markCompleted('${task._id}')" class="complete-btn" ${task.status === 'completed' ? 'disabled' : ''}>
                ✓ ${task.status === 'completed' ? 'Completed' : 'Mark Complete'}
            </button>
        </div>
    `;
    
    return div;
}

async function deleteTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

async function markCompleted(id) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'completed' })
        });
        
        if (response.ok) {
            createConfetti();
            loadTasks();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchQuote() {
    const fallbackQuotes = [
        { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { content: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
        { content: "Education is the most powerful weapon.", author: "Nelson Mandela" },
        { content: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { content: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
    ];

    try {
        const response = await fetch('https://api.quotable.io/random?tags=motivation,success');
        if (!response.ok) throw new Error('Quote API failed');
        const data = await response.json();
        document.getElementById('quote').innerHTML = `"${data.content}" <br>- ${data.author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        document.getElementById('quote').innerHTML = `"${randomQuote.content}" <br>- ${randomQuote.author}`;
    }
} 
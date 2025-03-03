# Kanban Board

[DEMO](https://kanban-test-task-8xqs95ukb-tetiana-veremchuks-projects.vercel.app/)

Kanban Board is a web application for task management using a Kanban board.  
It allows users to view, sort, and move tasks between columns.

## Project Description
The application integrates with the GitHub API, retrieving issues from a repository entered by the user.  
Tasks are categorized into three groups: **ToDo (new issues), In Progress (open issues with an assignee), and Done (closed issues)**.  
Users can change the status of tasks by dragging them between columns and reorder tasks within a column.  
Task positions are saved between browser sessions.

## Key Features
- Enter a GitHub repository and load issues
- View tasks in **ToDo, In Progress, and Done** categories
- Drag & drop tasks between columns and within a column
- Save task positions between browser sessions
- Automatically update the task list when a new repository is loaded

## Technologies Used

### Core Stack
- **React 18 + Vite** — Used for fast and efficient frontend development. Vite ensures instant compilation and quick startup.
- **TypeScript** — Adds static typing, preventing runtime errors and improving code auto-completion.
- **Redux Toolkit** — Manages application state, stores task lists, and synchronizes data between components.

### Functional Libraries
- **Dnd-kit** — A modern drag & drop library. 
- **React Testing Library + Vitest** — Used for component testing to verify correct rendering and user interactions.
- **React Bootstrap** — Provides pre-built UI components for quick and visually appealing styling.

### Deployment
- **Vercel** — Used for automatic deployment, ensuring instant updates to the application after each GitHub push.

## How to Run the Project Locally

```sh
# 1. Clone the repository
git clone https://github.com/TetianaVeremchuk/kanban-test-task.git

# 2. Navigate to the project directory
cd kanban-test-task

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

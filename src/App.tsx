import React from 'react';
import KanbanBoard from './components/KanbanBoard';
import { Container } from 'react-bootstrap';
import RepoInput from './components/RepoInput';

const App: React.FC = () => {
  return (
    <Container className="mt-4">
      <h1 className="text-center">Kanban Board</h1>
      <RepoInput />
      <KanbanBoard />
    </Container>
  );
};

export default App;

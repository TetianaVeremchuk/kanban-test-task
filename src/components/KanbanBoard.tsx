import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card } from 'react-bootstrap';

const KanbanBoard: React.FC = () => {
  const { issues, loading, error } = useSelector((state: RootState) => state.board);

  return (
    <div className="container mt-4">
      {loading && <p>Loading issues...</p>}
      {error && <p className="text-danger">{error}</p>}
      <div className="row">
        {['ToDo', 'InProgress', 'Done'].map((status) => (
          <div key={status} className="col-md-4">
            <h3>{status.replace(/([A-Z])/g, ' $1').trim()}</h3>
            {issues.filter((issue) => issue.status === status).length === 0 ? (
              <div style={{ minHeight: '50px', padding: '10px', border: '1px dashed gray' }}>No issues</div>
            ) : (
              issues
                .filter((issue) => issue.status === status)
                .map((issue) => (
                  <Card key={issue.id} className="mb-3 p-2">
                    <strong>{issue.title}</strong>
                    <p>#{issue.number} opened {new Date(issue.createdAt).toDateString()}</p>
                    <p>{issue.author} | Comments: {issue.comments}</p>
                  </Card>
                ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;

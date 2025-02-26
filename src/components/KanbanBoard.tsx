import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../store/store';
import { Card } from 'react-bootstrap';

const KanbanBoard: React.FC = () => {
  const issues = useSelector((state: RootState) => state.board.issues, shallowEqual);

  return (
    <div className="container mt-4">
      <div className="row">
        {['ToDo', 'InProgress', 'Done'].map((status) => (
          <div key={status} className="col-md-4" style={{ padding: '10px' }}>
            <h3>{status.replace(/([A-Z])/g, ' $1').trim()}</h3>
            {issues.filter((issue) => issue.status === status).length === 0 ? (
              <div
                style={{
                  minHeight: '150px',
                  border: '1px dashed gray',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                No issues
              </div>
            ) : (
              issues
                .filter((issue) => issue.status === status)
                .map((issue) => (
                  <Card key={issue.id} className="mb-3 p-2" style={{ backgroundColor: 'white' }}>
                    <strong>{issue.title}</strong>
                    <p>#{issue.id} opened {new Date(issue.createdAt).toDateString()}</p>
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

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, setRepoUrl } from '../store/boardSlice';
import { RootState } from '../store/store';
import { Button, Form, Spinner } from 'react-bootstrap';

const RepoInput: React.FC = () => {
  const [repoUrl, setRepoUrlInput] = useState('');
  const dispatch = useDispatch();
  const { loading, error, repoUrl: savedRepoUrl } = useSelector((state: RootState) => state.board);

  const handleLoadIssues = () => {
    if (repoUrl.trim()) {
      dispatch(setRepoUrl(repoUrl));
      dispatch(fetchIssues(repoUrl) as any);
    }
  };

  const match = savedRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  const owner = match ? match[1] : null;
  const repo = match ? match[2] : null;

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-12 d-flex">
          <Form.Control
            type="text"
            placeholder="Enter GitHub repo URL"
            value={repoUrl}
            onChange={(e) => setRepoUrlInput(e.target.value)}
            className="me-2 flex-grow-1"
          />
          <Button onClick={handleLoadIssues} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Load'}
          </Button>
        </div>
      </div>

      {owner && repo && (
        <div className="text-start mt-2">
          <a href={`https://github.com/${owner}`} target="_blank" rel="noopener noreferrer">
            <strong>{owner}</strong>
          </a>{' '}
          &gt;{' '}
          <a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noopener noreferrer">
            {repo}
          </a>
        </div>
      )}

      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default RepoInput;

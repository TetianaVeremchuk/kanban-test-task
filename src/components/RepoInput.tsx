import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../store/boardSlice';
import { RootState } from '../store/store';
import { Button, Form, Spinner } from 'react-bootstrap';

const RepoInput: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.board);

  const handleLoadIssues = () => {
    if (repoUrl.trim()) {
      dispatch(fetchIssues(repoUrl) as any);
    }
  };

  return (
    <div className="d-flex justify-content-center my-3">
      <Form.Control
        type="text"
        placeholder="Enter GitHub repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className="me-2"
      />
      <Button onClick={handleLoadIssues} disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : 'Load'}
      </Button>
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default RepoInput;

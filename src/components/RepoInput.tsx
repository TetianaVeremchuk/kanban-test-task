import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setRepoUrl } from '../store/repoSlice';
import { Button, Form } from 'react-bootstrap';

const RepoInput: React.FC = () => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');

  const handleLoad = () => {
    if (!url.trim()) return;
    
    try {
      const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        alert('Invalid GitHub repo URL! Use format: https://github.com/user/repo');
        return;
      }
      
      const [, owner, repo] = match;
      dispatch(setRepoUrl({ owner, repo }));
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
    }
  };

  return (
    <div className="mb-4 text-center">
      <Form.Group className="d-flex justify-content-center">
        <Form.Control
          type="text"
          placeholder="Enter repo URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ maxWidth: '400px', marginRight: '10px' }}
        />
        <Button onClick={handleLoad} variant="primary">
          Load
        </Button>
      </Form.Group>
    </div>
  );
};

export default RepoInput;

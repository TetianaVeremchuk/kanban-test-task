import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssues, setRepoUrl } from "../store/boardSlice";
import { RootState } from "../store/store";
import { Button, Form, Spinner } from "react-bootstrap";

const RepoInput: React.FC = () => {
  const [repoUrl, setRepoUrlInput] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, repoUrl: savedRepoUrl } = useSelector(
    (state: RootState) => state.board
  );

  const handleLoadIssues = () => {
    if (repoUrl.trim()) {
      setIsInvalid(false);
      dispatch(setRepoUrl(repoUrl));
      dispatch(fetchIssues(repoUrl) as any);
    } else {
      setIsInvalid(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrlInput(e.target.value);
    if (e.target.value.trim()) {
      setIsInvalid(false);
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
            onChange={handleInputChange}
            className={`me-2 flex-grow-1 ${isInvalid ? "border border-danger" : ""}`}
          />
          <Button onClick={handleLoadIssues} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Load"}
          </Button>
        </div>
      </div>

      {isInvalid && (
        <p className="text-danger mt-2">Please enter a valid GitHub repository URL.</p>
      )}

      {owner && repo && (
        <div className="text-start mt-2">
          <a
            href={`https://github.com/${owner}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>{owner}</strong>
          </a>{" "}
          &gt;{" "}
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {repo}
          </a>
        </div>
      )}

      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default RepoInput;

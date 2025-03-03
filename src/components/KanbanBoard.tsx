import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { updateIssueStatus, updateIssuesOrder } from "../store/boardSlice";
import { DndContext, closestCorners, DragEndEvent } from "@dnd-kit/core";
import Column from "./Column";
import { Issue } from "../types";

const columns = {
  ToDo: "ToDo",
  InProgress: "InProgress",
  Done: "Done",
};

const KanbanBoard: React.FC = () => {
  const dispatch = useDispatch();
  const { issues, loading, error, repoUrl } = useSelector((state: RootState) => state.board);
  const [localIssues, setLocalIssues] = useState<Issue[]>([]);

  useEffect(() => {
    setLocalIssues(issues);
  }, [issues]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const issueId = parseInt(active.id as string, 10);
    const overId = over.id as string;

    const draggedIssue = localIssues.find(issue => issue.id === issueId);
    if (!draggedIssue) return;

    if (Object.keys(columns).includes(overId)) {
      const newStatus = overId as "ToDo" | "InProgress" | "Done";
      dispatch(updateIssueStatus({ id: issueId, status: newStatus }));
      setLocalIssues(prevIssues =>
        prevIssues.map(issue => (issue.id === issueId ? { ...issue, status: newStatus } : issue))
      );
      return;
    }

    const targetIssue = localIssues.find(issue => issue.id === parseInt(overId, 10));
    if (targetIssue) {
      const oldColumn = draggedIssue.status;
      const newColumn = targetIssue.status;
      if (oldColumn !== newColumn) {
        dispatch(updateIssueStatus({ id: issueId, status: newColumn }));
        setLocalIssues(prevIssues =>
          prevIssues.map(issue => (issue.id === issueId ? { ...issue, status: newColumn } : issue))
        );
      } else {
        setLocalIssues(prevIssues => {
          const columnIssues = prevIssues.filter(issue => issue.status === draggedIssue.status);
          const oldIndex = columnIssues.findIndex(issue => issue.id === issueId);
          const newIndex = columnIssues.findIndex(issue => issue.id === parseInt(overId, 10));

          if (oldIndex !== -1 && newIndex !== -1) {
            const updatedColumnIssues = [...columnIssues];
            updatedColumnIssues.splice(newIndex, 0, updatedColumnIssues.splice(oldIndex, 1)[0]);
            const otherIssues = prevIssues.filter(issue => issue.status !== draggedIssue.status);
            const newIssues = [...otherIssues, ...updatedColumnIssues];

            dispatch(updateIssuesOrder(newIssues));
            return newIssues;
          }
          return prevIssues;
        });
      }
    }
  };

  if (!repoUrl) {
    return <p className="text-center mt-4"> Please enter a repository URL to load issues.</p>;
  }

  return (
    <div className="container mt-4">
      {loading && <p>Loading issues...</p>}
      {error && <p className="text-danger">{error}</p>}

      <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="row">
          {Object.entries(columns).map(([status, label]) => (
            <Column key={status} id={status as "ToDo" | "InProgress" | "Done"} title={label}
              issues={localIssues.filter(issue => issue.status === status)} />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;

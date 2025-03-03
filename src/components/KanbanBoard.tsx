import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { updateIssueStatus, updateIssuesOrder } from "../store/boardSlice";
import { Card } from "react-bootstrap";
import {
  DndContext,
  closestCorners,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";

interface Issue {
  id: number;
  title: string;
  number: number;
  createdAt: string;
  author: string;
  comments: number;
  status: "ToDo" | "InProgress" | "Done";
  state: "open" | "closed";
}

interface ColumnProps {
  id: "ToDo" | "InProgress" | "Done";
  title: string;
  issues: Issue[];
}

interface IssueCardProps {
  issue: Issue;
}

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

    const draggedIssue = localIssues.find((issue) => issue.id === issueId);
    if (!draggedIssue) return;

    if (Object.keys(columns).includes(overId)) {
      const newStatus = overId as "ToDo" | "InProgress" | "Done";

      dispatch(updateIssueStatus({ id: issueId, status: newStatus }));

      setLocalIssues((prevIssues) => {
        const updatedIssues = prevIssues.map((issue) =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        );

        return updatedIssues;
      });

      return;
    }

    const targetIssue = localIssues.find((issue) => issue.id === parseInt(overId, 10));
    if (targetIssue) {
      const oldColumn = draggedIssue.status;
      const newColumn = targetIssue.status;

      if (oldColumn !== newColumn) {

        dispatch(updateIssueStatus({ id: issueId, status: newColumn }));

        setLocalIssues((prevIssues) => {
          const updatedIssues = prevIssues.map((issue) =>
            issue.id === issueId ? { ...issue, status: newColumn } : issue
          );

          return updatedIssues;
        });
      } else {

        setLocalIssues((prevIssues) => {
          const columnIssues = prevIssues.filter((issue) => issue.status === draggedIssue.status);
          const oldIndex = columnIssues.findIndex((issue) => issue.id === issueId);
          const newIndex = columnIssues.findIndex((issue) => issue.id === parseInt(overId, 10));

          if (oldIndex !== -1 && newIndex !== -1) {
            const updatedColumnIssues = arrayMove(columnIssues, oldIndex, newIndex);
            const otherIssues = prevIssues.filter((issue) => issue.status !== draggedIssue.status);
            const newIssues = [...otherIssues, ...updatedColumnIssues];

            dispatch(updateIssuesOrder(newIssues));
            return newIssues;
          }
          return prevIssues;
        });
      }

      return;
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

const Column: React.FC<ColumnProps> = ({ id, title, issues }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="col-md-4">
      <h3>{title}</h3>
      <SortableContext items={issues.map(issue => String(issue.id))} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="p-2 border rounded" style={{ minHeight: "200px", background: "#f8f9fa" }}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: String(issue.id),
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} className="mb-3">
      <Card className="p-2">
        <strong>{issue.title}</strong>
        <p>#{issue.number} opened {new Date(issue.createdAt).toDateString()}</p>
        <p>{issue.author} | Comments: {issue.comments}</p>
      </Card>
    </div>
  );
};

export default KanbanBoard;

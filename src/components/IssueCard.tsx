import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { IssueCardProps } from "../types";
import { Card } from "react-bootstrap";

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

export default IssueCard;
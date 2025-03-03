import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ColumnProps } from "../types";
import IssueCard from "./IssueCard";


const Column: React.FC<ColumnProps> = ({ id, title, issues }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="col-md-4">
      <h3>{title}</h3>
      <SortableContext items={issues.map(issue => String(issue.id))} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="p-2 border rounded" style={{ minHeight: "200px", background: "#f8f9fa" }}>
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default Column;
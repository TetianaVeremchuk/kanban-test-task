export interface Issue {
  id: number;
  title: string;
  number: number;
  createdAt: string;
  author: string;
  comments: number;
  state: string;
  assignees: any[];
  labels: any[];
  status: "ToDo" | "InProgress" | "Done";
}

export interface ColumnProps {
  id: "ToDo" | "InProgress" | "Done";
  title: string;
  issues: Issue[];
}

export interface IssueCardProps {
  issue: Issue;
}

export interface Issue {
  id: number;
  title: string;
  number: number;
  createdAt: string;
  author: string;
  comments: number;
  status: "ToDo" | "InProgress" | "Done";
  state: "open" | "closed";
}

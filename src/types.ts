export interface Issue {
  id: number;
  title: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  createdAt: string;
  author: string;
  comments: number;
}

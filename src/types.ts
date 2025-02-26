export interface Issue {
  id: number;
  number: number;
  title: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  createdAt: string;
  author: string;
  comments: number;
}

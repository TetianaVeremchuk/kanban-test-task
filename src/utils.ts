import { Issue } from "./types";

export const loadStateFromLocalStorage = (repoUrl: string): Issue[] => {
  try {
    const savedState = localStorage.getItem(`kanban_issues_${repoUrl}`);
    return savedState ? JSON.parse(savedState) as Issue[] : [];
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return [];
  }
};

export const getStatus = (issue: any): "ToDo" | "InProgress" | "Done" => {
  if (issue.state === 'closed') return 'Done';
  if (issue.assignees?.length > 0 || issue.labels?.some((label: { name: string }) => /progress|wip/i.test(label.name))) {
    return 'InProgress';
  }
  return 'ToDo';
};
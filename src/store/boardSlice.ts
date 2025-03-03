import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Issue } from '../types';

interface BoardState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  repoUrl: string;
}

const loadStateFromLocalStorage = (repoUrl: string): Issue[] => {
  try {
    const savedState = localStorage.getItem(`kanban_issues_${repoUrl}`);
    return savedState ? (JSON.parse(savedState) as Issue[]) : [];
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return [];
  }
};

const initialState: BoardState = {
  issues: [],
  loading: false,
  error: null,
  repoUrl: '',
};

const getStatus = (issue: any): "ToDo" | "InProgress" | "Done" => {
  if (issue.state === 'closed') return 'Done';
  if (issue.assignees?.length > 0 || issue.labels?.some((label: { name: string }) => /progress|wip/i.test(label.name))) {
    return 'InProgress';
  }
  return 'ToDo';
};

export const fetchIssues = createAsyncThunk<Issue[], string, { rejectValue: string }>(
  'board/fetchIssues',
  async (repoUrl, { rejectWithValue }) => {
    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error('Invalid repository URL');

      const [, owner, repo] = match;
      const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch issues');

      const data: any[] = await response.json();

      const issues: Issue[] = data.map((issue) => ({
        id: issue.id,
        title: issue.title,
        number: issue.number,
        createdAt: issue.created_at,
        author: issue.user?.login || "Unknown",
        comments: issue.comments,
        state: issue.state,
        assignees: issue.assignees ?? [],
        labels: issue.labels ?? [],
        status: getStatus(issue),
      }));

      const savedIssues = loadStateFromLocalStorage(repoUrl);
      return savedIssues.length > 0 ? savedIssues : issues;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setRepoUrl: (state, action: PayloadAction<string>) => {
      state.repoUrl = action.payload;
      state.issues = loadStateFromLocalStorage(action.payload);
    },
    
    updateIssueStatus: (state, action: PayloadAction<{ id: number; status: "ToDo" | "InProgress" | "Done" }>) => {
      const issueIndex = state.issues.findIndex((issue) => issue.id === action.payload.id);
      if (issueIndex !== -1) {
        state.issues[issueIndex] = { ...state.issues[issueIndex], status: action.payload.status };
        localStorage.setItem(`kanban_issues_${state.repoUrl}`, JSON.stringify(state.issues));
      }
    },
    
    updateIssuesOrder: (state, action: PayloadAction<Issue[]>) => {
      state.issues = action.payload;
      localStorage.setItem(`kanban_issues_${state.repoUrl}`, JSON.stringify(state.issues));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
        localStorage.setItem(`kanban_issues_${state.repoUrl}`, JSON.stringify(state.issues));
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  }
});


export const { setRepoUrl, updateIssueStatus, updateIssuesOrder } = boardSlice.actions;
export default boardSlice.reducer;

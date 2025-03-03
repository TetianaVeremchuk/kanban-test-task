import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Issue } from '../types';
import { loadStateFromLocalStorage, getStatus } from '../utils';

export interface BoardState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  repoUrl: string;
}

const initialState: BoardState = {
  issues: [],
  loading: false,
  error: null,
  repoUrl: '',
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
      const issues: Issue[] = data.map(issue => ({
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

      return loadStateFromLocalStorage(repoUrl).length > 0 ? loadStateFromLocalStorage(repoUrl) : issues;
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
      const issue = state.issues.find(issue => issue.id === action.payload.id);
      if (issue) {
        issue.status = action.payload.status;
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

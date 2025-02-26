import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Issue } from '../types';

interface BoardState {
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

export const fetchIssues = createAsyncThunk(
  'board/fetchIssues',
  async (repoUrl: string, { rejectWithValue }) => {
    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error('Invalid repository URL');

      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all`);

      if (!response.ok) throw new Error('Failed to fetch issues');
      const data = await response.json();
      console.log('Fetched issues:', data);

      return data.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        number: issue.number,
        createdAt: issue.created_at,
        author: issue.user.login,
        comments: issue.comments,
        status:
          issue.state === 'closed'
            ? 'Done'
            : (issue.assignees && issue.assignees.length > 0) ||
              (issue.labels && issue.labels.some((label: any) => /progress|wip/i.test(label.name)))
            ? 'InProgress'
            : 'ToDo',
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setRepoUrl: (state, action: PayloadAction<string>) => {
      state.repoUrl = action.payload;
    },
    updateIssueStatus: (state, action: PayloadAction<{ id: number; status: "ToDo" | "InProgress" | "Done" }>) => {
      const issue = state.issues.find((issue) => issue.id === action.payload.id);
      if (issue) {
        issue.status = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action: PayloadAction<Issue[]>) => {
        state.loading = false;
        state.issues = action.payload;
        console.log('Sorted issues:', action.payload);
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setRepoUrl, updateIssueStatus } = boardSlice.actions;
export default boardSlice.reducer;

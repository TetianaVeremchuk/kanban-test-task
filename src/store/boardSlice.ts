import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Issue } from '../types';

interface BoardState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  repoUrl: string;
}

const loadStateFromLocalStorage = (): Issue[] => {
  try {
    const savedState = localStorage.getItem('kanban_issues');
    return savedState ? (JSON.parse(savedState) as Issue[]) : [];
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return [];
  }
};

const initialState: BoardState = {
  issues: loadStateFromLocalStorage(),
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

      console.log(`Fetching issues from: ${url}`);
      const response = await fetch(url);
      if (response.status === 403) throw new Error('GitHub API rate limit exceeded. Try again later.');
      if (!response.ok) throw new Error('Failed to fetch issues');

      const data: any[] = await response.json();
      console.log('Fetched issues:', data);

      return data.map((issue) => ({
        id: issue.id,
        title: issue.title,
        number: issue.number,
        createdAt: issue.created_at,
        author: issue.user?.login || "Unknown",
        comments: issue.comments,
        state: issue.state,
        assignees: issue.assignees ?? [],
        labels: issue.labels ?? [],
        status:
          issue.state === 'closed'
            ? 'Done'
            : (issue.assignees.length > 0) ||
              (issue.labels.some((label: { name: string }) => /progress|wip/i.test(label.name)))
            ? 'InProgress'
            : 'ToDo',
      }));
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
    },
    updateIssueStatus: (state, action: PayloadAction<{ id: number; status: "ToDo" | "InProgress" | "Done" }>) => {
      const issue = state.issues.find((issue) => issue.id === action.payload.id);
      if (issue) {
        issue.status = action.payload.status;
      }
      localStorage.setItem('kanban_issues', JSON.stringify(state.issues));
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
        localStorage.setItem('kanban_issues', JSON.stringify(state.issues));
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  }
});

export const { setRepoUrl, updateIssueStatus } = boardSlice.actions;
export default boardSlice.reducer;

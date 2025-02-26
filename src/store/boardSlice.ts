import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Issue } from '../types';

interface BoardState {
  issues: Issue[];
}

const initialState: BoardState = {
  issues: [],
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    addIssue: (state, action: PayloadAction<Issue>) => {
      state.issues.push(action.payload);
    },
    updateIssueStatus: (state, action: PayloadAction<{ id: number; status: "ToDo" | "InProgress" | "Done" }>) => {
      const issue = state.issues.find((issue) => issue.id === action.payload.id);
      if (issue) {
        issue.status = action.payload.status;
      }
    }
    
  },
});

export const { addIssue, updateIssueStatus } = boardSlice.actions;
export default boardSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RepoState {
  owner: string;
  repo: string;
}

const initialState: RepoState = {
  owner: '',
  repo: '',
};

const repoSlice = createSlice({
  name: 'repo',
  initialState,
  reducers: {
    setRepoUrl: (state, action: PayloadAction<{ owner: string; repo: string }>) => {
      state.owner = action.payload.owner;
      state.repo = action.payload.repo;
    },
  },
});

export const { setRepoUrl } = repoSlice.actions;
export default repoSlice.reducer;

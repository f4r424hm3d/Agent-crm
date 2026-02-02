import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  agents: [],
  currentAgent: null,
  pendingAgents: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAgents: (state, action) => {
      state.agents = action.payload.agents;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setPendingAgents: (state, action) => {
      state.pendingAgents = action.payload;
      state.loading = false;
    },
    setCurrentAgent: (state, action) => {
      state.currentAgent = action.payload;
      state.loading = false;
    },
    addAgent: (state, action) => {
      state.agents.unshift(action.payload);
    },
    updateAgent: (state, action) => {
      const index = state.agents.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
      if (state.currentAgent?._id === action.payload._id) {
        state.currentAgent = action.payload;
      }
    },
    deleteAgent: (state, action) => {
      state.agents = state.agents.filter(a => a._id !== action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setAgents,
  setPendingAgents,
  setCurrentAgent,
  addAgent,
  updateAgent,
  deleteAgent,
  setError,
  clearError,
} = agentSlice.actions;

export default agentSlice.reducer;

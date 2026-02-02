import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    agent: '',
    university: '',
    course: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  statusCounts: {
    draft: 0,
    submitted: 0,
    underReview: 0,
    offerIssued: 0,
    offerAccepted: 0,
    feePaid: 0,
    enrolled: 0,
    rejected: 0,
  },
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setApplications: (state, action) => {
      state.applications = action.payload.applications;
      state.pagination = action.payload.pagination;
      if (action.payload.statusCounts) {
        state.statusCounts = action.payload.statusCounts;
      }
      state.loading = false;
    },
    setCurrentApplication: (state, action) => {
      state.currentApplication = action.payload;
      state.loading = false;
    },
    addApplication: (state, action) => {
      state.applications.unshift(action.payload);
    },
    updateApplication: (state, action) => {
      const index = state.applications.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
      if (state.currentApplication?._id === action.payload._id) {
        state.currentApplication = action.payload;
      }
    },
    deleteApplication: (state, action) => {
      state.applications = state.applications.filter(a => a._id !== action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
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
  setApplications,
  setCurrentApplication,
  addApplication,
  updateApplication,
  deleteApplication,
  setFilters,
  setError,
  clearError,
} = applicationSlice.actions;

export default applicationSlice.reducer;

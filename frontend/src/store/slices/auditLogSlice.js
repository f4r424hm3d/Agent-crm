import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
  loading: false,
  error: null,
  filters: {
    user: '',
    role: '',
    action: '',
    entity: '',
    dateFrom: '',
    dateTo: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

const auditLogSlice = createSlice({
  name: 'auditLog',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLogs: (state, action) => {
      state.logs = action.payload.logs;
      state.pagination = action.payload.pagination;
      state.loading = false;
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
  setLogs,
  setFilters,
  setError,
  clearError,
} = auditLogSlice.actions;

export default auditLogSlice.reducer;

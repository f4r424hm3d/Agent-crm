import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  universities: [],
  currentUniversity: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    country: '',
    status: 'all',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const universitySlice = createSlice({
  name: 'university',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUniversities: (state, action) => {
      state.universities = action.payload.universities;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setCurrentUniversity: (state, action) => {
      state.currentUniversity = action.payload;
      state.loading = false;
    },
    addUniversity: (state, action) => {
      state.universities.unshift(action.payload);
    },
    updateUniversity: (state, action) => {
      const index = state.universities.findIndex(u => u._id === action.payload._id);
      if (index !== -1) {
        state.universities[index] = action.payload;
      }
      if (state.currentUniversity?._id === action.payload._id) {
        state.currentUniversity = action.payload;
      }
    },
    deleteUniversity: (state, action) => {
      state.universities = state.universities.filter(u => u._id !== action.payload);
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
  setUniversities,
  setCurrentUniversity,
  addUniversity,
  updateUniversity,
  deleteUniversity,
  setFilters,
  setError,
  clearError,
} = universitySlice.actions;

export default universitySlice.reducer;

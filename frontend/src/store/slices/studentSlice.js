import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: [],
  currentStudent: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    agent: '',
    status: 'all',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStudents: (state, action) => {
      state.students = action.payload.students;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setCurrentStudent: (state, action) => {
      state.currentStudent = action.payload;
      state.loading = false;
    },
    addStudent: (state, action) => {
      state.students.unshift(action.payload);
    },
    updateStudent: (state, action) => {
      const index = state.students.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
      if (state.currentStudent?._id === action.payload._id) {
        state.currentStudent = action.payload;
      }
    },
    deleteStudent: (state, action) => {
      state.students = state.students.filter(s => s._id !== action.payload);
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
  setStudents,
  setCurrentStudent,
  addStudent,
  updateStudent,
  deleteStudent,
  setFilters,
  setError,
  clearError,
} = studentSlice.actions;

export default studentSlice.reducer;

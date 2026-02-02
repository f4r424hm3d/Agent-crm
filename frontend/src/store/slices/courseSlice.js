import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    university: '',
    level: '',
    status: 'all',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCourses: (state, action) => {
      state.courses = action.payload.courses;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
      state.loading = false;
    },
    addCourse: (state, action) => {
      state.courses.unshift(action.payload);
    },
    updateCourse: (state, action) => {
      const index = state.courses.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?._id === action.payload._id) {
        state.currentCourse = action.payload;
      }
    },
    deleteCourse: (state, action) => {
      state.courses = state.courses.filter(c => c._id !== action.payload);
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
  setCourses,
  setCurrentCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  setFilters,
  setError,
  clearError,
} = courseSlice.actions;

export default courseSlice.reducer;

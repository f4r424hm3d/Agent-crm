import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    totalApplications: 0,
    activeAgents: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
    totalStudents: 0,
    totalUniversities: 0,
    totalCourses: 0,
  },
  recentApplications: [],
  chartData: {
    applications: [],
    revenue: [],
    agents: [],
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
    },
    setRecentApplications: (state, action) => {
      state.recentApplications = action.payload;
    },
    setChartData: (state, action) => {
      state.chartData = { ...state.chartData, ...action.payload };
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
  setStats,
  setRecentApplications,
  setChartData,
  setError,
  clearError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

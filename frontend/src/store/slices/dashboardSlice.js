import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const role = auth.user?.role;
      const data = await dashboardService.getDashboardData(role);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload || initialState.stats;
        state.recentApplications = action.payload?.recentApplications || [];
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
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

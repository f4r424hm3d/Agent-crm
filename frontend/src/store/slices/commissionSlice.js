import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  commissions: [],
  currentCommission: null,
  loading: false,
  error: null,
};

const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCommissions: (state, action) => {
      state.commissions = action.payload;
      state.loading = false;
    },
    setCurrentCommission: (state, action) => {
      state.currentCommission = action.payload;
      state.loading = false;
    },
    addCommission: (state, action) => {
      state.commissions.unshift(action.payload);
    },
    updateCommission: (state, action) => {
      const index = state.commissions.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.commissions[index] = action.payload;
      }
      if (state.currentCommission?._id === action.payload._id) {
        state.currentCommission = action.payload;
      }
    },
    deleteCommission: (state, action) => {
      state.commissions = state.commissions.filter(c => c._id !== action.payload);
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
  setCommissions,
  setCurrentCommission,
  addCommission,
  updateCommission,
  deleteCommission,
  setError,
  clearError,
} = commissionSlice.actions;

export default commissionSlice.reducer;

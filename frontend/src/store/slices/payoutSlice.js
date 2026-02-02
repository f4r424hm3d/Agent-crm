import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payouts: [],
  currentPayout: null,
  payoutRequests: [],
  earnings: {
    pending: 0,
    approved: 0,
    paid: 0,
    total: 0,
  },
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPayouts: (state, action) => {
      state.payouts = action.payload.payouts;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setPayoutRequests: (state, action) => {
      state.payoutRequests = action.payload;
      state.loading = false;
    },
    setEarnings: (state, action) => {
      state.earnings = action.payload;
      state.loading = false;
    },
    setCurrentPayout: (state, action) => {
      state.currentPayout = action.payload;
      state.loading = false;
    },
    addPayout: (state, action) => {
      state.payouts.unshift(action.payload);
    },
    updatePayout: (state, action) => {
      const index = state.payouts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.payouts[index] = action.payload;
      }
      const requestIndex = state.payoutRequests.findIndex(p => p._id === action.payload._id);
      if (requestIndex !== -1) {
        state.payoutRequests[requestIndex] = action.payload;
      }
      if (state.currentPayout?._id === action.payload._id) {
        state.currentPayout = action.payload;
      }
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
  setPayouts,
  setPayoutRequests,
  setEarnings,
  setCurrentPayout,
  addPayout,
  updatePayout,
  setError,
  clearError,
} = payoutSlice.actions;

export default payoutSlice.reducer;

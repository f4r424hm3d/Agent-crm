import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import agentReducer from './slices/agentSlice';
import universityReducer from './slices/universitySlice';
import courseReducer from './slices/courseSlice';
import studentReducer from './slices/studentSlice';
import applicationReducer from './slices/applicationSlice';
import commissionReducer from './slices/commissionSlice';
import payoutReducer from './slices/payoutSlice';
import dashboardReducer from './slices/dashboardSlice';
import auditLogReducer from './slices/auditLogSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agent: agentReducer,
    university: universityReducer,
    course: courseReducer,
    student: studentReducer,
    application: applicationReducer,
    commission: commissionReducer,
    payout: payoutReducer,
    dashboard: dashboardReducer,
    dashboard: dashboardReducer,
    auditLog: auditLogReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

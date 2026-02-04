import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import settingService from '../../services/settingService';

// Thunk to fetch settings
export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await settingService.getSettings();
            // Use the raw data structure or helper to flatten it for easy access
            let flattened = {};

            // If backend returns { data: { group: { key: value } } }
            // We want to store a flattened version for easier access in components
            if (response.data) {
                Object.values(response.data).forEach(group => {
                    Object.assign(flattened, group);
                });
            }

            return flattened;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        data: {}, // Stores key-value pairs of all settings
        loading: false,
        error: null,
        isInitialized: false, // Track if settings have been loaded at least once
    },
    reducers: {
        // Optional: Synchronous update if needed (e.g. optimistic updates)
        updateSetting: (state, action) => {
            const { key, value } = action.payload;
            state.data[key] = value;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.isInitialized = true;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Even on error, mark as initialized to prevent infinite loading loops if critical
                state.isInitialized = true;
            });
    },
});

export const { updateSetting } = settingsSlice.actions;
export const selectSettings = (state) => state.settings.data;
export const selectSettingsLoading = (state) => state.settings.loading;
export const selectSetting = (key) => (state) => state.settings.data[key];

export default settingsSlice.reducer;

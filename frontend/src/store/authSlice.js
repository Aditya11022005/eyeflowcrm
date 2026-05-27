import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('eyeflow_token');
const user = JSON.parse(localStorage.getItem('eyeflow_user') || 'null');
const storeInfo = JSON.parse(localStorage.getItem('eyeflow_store') || 'null');

const initialState = {
  user,
  store: storeInfo,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.store = action.payload.store || null;
      state.token = action.payload.token;
      state.error = null;

      localStorage.setItem('eyeflow_token', action.payload.token);
      localStorage.setItem('eyeflow_user', JSON.stringify(action.payload.user));
      if (action.payload.store) {
        localStorage.setItem('eyeflow_store', JSON.stringify(action.payload.store));
      }
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.store = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('eyeflow_token');
      localStorage.removeItem('eyeflow_user');
      localStorage.removeItem('eyeflow_store');
    },
    updateStoreInfo: (state, action) => {
      state.store = action.payload;
      localStorage.setItem('eyeflow_store', JSON.stringify(action.payload));
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { authStart, authSuccess, authFailure, logout, updateStoreInfo, clearError } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Safe JSON parse function
const safeJSONParse = (item) => {
  try {
    const value = localStorage.getItem(item);
    // Check if value exists and is not "undefined"
    if (value && value !== 'undefined' && value !== 'null') {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error(`Error parsing ${item} from localStorage:`, error);
    return null;
  }
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Create user object from response
      const user = {
        id: response.data.id,
        role: response.data.role,
        // Add any other user data from response
      };
      
      // Store user as JSON string
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Login successful!');
      return { 
        token: response.data.token, 
        user: user,
        role: response.data.role 
      };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: safeJSONParse('user'),
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
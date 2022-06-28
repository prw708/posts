import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJSON, postJSON } from './json';

const initialState = {
  users: [],
  status: 'idle',
  error: null
};

export const getUsers = createAsyncThunk(
  'users/getUsers',
  async () => {
    const response = await getJSON('/projects/posts/users/all', {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json;charset=UTF-8',
      'CSRF-Token': ''
    });
    if (response) {
      const parsedResponse = response.map((r) => {
        return { 
          id: r._id,
          author: r.username
        };
      });
      return parsedResponse;
    } else {
      return [];
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
    builder
      .addCase(getUsers.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.status = 'success';
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
  },
});

export default usersSlice.reducer;

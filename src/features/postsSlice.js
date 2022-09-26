import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJSON, postJSON } from './json';

const initialState = {
  posts: [],
  status: 'idle',
  error: null
};

export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async (data, { rejectWithValue }) => {
    try {
      const response = await getJSON('/projects/posts/all', {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8'
      });
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getPagedPosts = createAsyncThunk(
  'posts/getPagedPosts',
  async (data, { rejectWithValue }) => {
    try {
      let path = '/projects/posts/all/' + data.size + '/' + data.skip + '?searchText=' + data.searchText;
      const response = await getJSON(path, {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8'
      });
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getUserPagedPosts = createAsyncThunk(
  'posts/getUserPagedPosts',
  async (data, { rejectWithValue }) => {
    try {
      let path = '/projects/posts/users/' + data.author + '/' + data.size + '/' + data.skip + '?searchText=' + data.searchText;
      const response = await getJSON(path, {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8'
      });
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  async (initialPost, { rejectWithValue }) => {
    try {
      const response = await postJSON('/projects/posts/add', {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8',
        'CSRF-Token': initialPost.csrfToken
      }, initialPost);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async (initialPost, { rejectWithValue }) => {
    try {
      const response = await postJSON('/projects/posts/update', {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8',
        'CSRF-Token': initialPost.csrfToken
      }, initialPost);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async (initialComment, { rejectWithValue }) => {
    try {
      const response = await postJSON('/projects/posts/comments/add', {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8',
        'CSRF-Token': initialComment.csrfToken
      }, initialComment);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async (initialComment, { rejectWithValue }) => {
    try { 
      const response = await postJSON('/projects/posts/comments/delete', {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8',
        'CSRF-Token': initialComment.csrfToken
      }, initialComment);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (initialPost, { rejectWithValue }) => {
    try {
      const response = await postJSON('/projects/posts/delete', {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=UTF-8',
        'CSRF-Token': initialPost.csrfToken
      }, initialPost);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
    builder
      .addCase(getPosts.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.status = 'success';
        state.posts = action.payload;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(getPagedPosts.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(getPagedPosts.fulfilled, (state, action) => {
        state.status = 'success';
        state.posts = action.payload;
      })
      .addCase(getPagedPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(getUserPagedPosts.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(getUserPagedPosts.fulfilled, (state, action) => {
        state.status = 'success';
        state.posts = action.payload;
      })
      .addCase(getUserPagedPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.status = 'success';
        state.error = null;
        state.posts.push(action.payload);
      })
      .addCase(addNewPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.status = 'success';
        state.error = null;
        const { id, title, date, post } = action.payload;
        const existingPost = state.posts.find((post) => post.id === id);
        existingPost.title = title;
        existingPost.date = date;
        existingPost.post = post;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.status = 'success';
        state.error = null;
        const { id, postId, author, date, comment, threadId } = action.payload;
        const existingPost = state.posts.find((post) => post.id === postId);
        if (threadId === -1) {
          existingPost.comments.push([{
            id: id,
            author: author,
            date: date,
            comment: comment
          }]);
        } else {
          existingPost.comments[threadId].push({
            id: id,
            author: author,
            date: date,
            comment: comment
          });
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = 'success';
        state.error = null;
        const { id, threadId, commentId } = action.payload;
        const post = state.posts.find((post) => post.id === id);
        if (commentId === 0) {
          post.comments.splice(threadId, 1);
        } else {
          post.comments[threadId].splice(commentId, 1);
          if (post.comments[threadId].length === 0) {
            post.comments.splice(threadId, 1);
          }
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.status = 'success';
        state.error = null;
        const { id } = action.payload;
        state.posts = state.posts.filter((post) => post.id !== id);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
  },
});

export default postsSlice.reducer;

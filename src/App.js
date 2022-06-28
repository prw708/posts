import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.css';
import Layout from './components/Layout';
import Home from './components/Home';
import { AddPostForm } from './components/AddPostForm';
import { EditPostForm } from './components/EditPostForm';
import Post from './components/Post';
import Users from './components/Users';
import User from './components/User';
import NotFound from './components/NotFound';

function App(props) {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/projects/posts/" element={<Layout {...props} />}>
            <Route index element={<Home />} />
            <Route path="add" element={<AddPostForm {...props} />} />
            <Route path=":postId" element={<Post {...props} />} />
            <Route path="edit/:postId" element={<EditPostForm {...props} />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:user" element={<User />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;

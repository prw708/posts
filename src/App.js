import React, { useState } from 'react';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState(0);
  const [updateMessageTimeout, setUpdateMessageTimeout] = useState(null);

  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/projects/posts/" element={<Layout 
            {...props} 
            updateMessage={updateMessage}
            setUpdateMessage={setUpdateMessage}
            updateMessageTimeout={updateMessageTimeout}
            setUpdateMessageTimeout={setUpdateMessageTimeout}
            successMessage={successMessage}
            errorMessage={errorMessage}
          />}>
            <Route index element={<Home 
              {...props} 
              updateMessage={updateMessage}
              setUpdateMessage={setUpdateMessage}
              updateMessageTimeout={updateMessageTimeout}
              setUpdateMessageTimeout={setUpdateMessageTimeout}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />} />
            <Route path="add" element={<AddPostForm 
              {...props} 
              updateMessage={updateMessage}
              setUpdateMessage={setUpdateMessage}
              updateMessageTimeout={updateMessageTimeout}
              setUpdateMessageTimeout={setUpdateMessageTimeout}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />} />
            <Route path=":postId" element={<Post 
              {...props} 
              updateMessage={updateMessage}
              setUpdateMessage={setUpdateMessage}
              updateMessageTimeout={updateMessageTimeout}
              setUpdateMessageTimeout={setUpdateMessageTimeout}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />} />
            <Route path="edit/:postId" element={<EditPostForm 
              {...props} 
              updateMessage={updateMessage}
              setUpdateMessage={setUpdateMessage}
              updateMessageTimeout={updateMessageTimeout}
              setUpdateMessageTimeout={setUpdateMessageTimeout}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />} />
            <Route path="users" element={<Users 
              {...props} 
              updateMessage={updateMessage}
              setUpdateMessage={setUpdateMessage}
              updateMessageTimeout={updateMessageTimeout}
              setUpdateMessageTimeout={setUpdateMessageTimeout}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />} />
            <Route path="users/:user" element={<User 
              {...props} 
              updateMessage={updateMessage}
              setUpdateMessage={setUpdateMessage}
              updateMessageTimeout={updateMessageTimeout}
              setUpdateMessageTimeout={setUpdateMessageTimeout}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />} />
            <Route path="*" element={<NotFound 
              {...props} 
              updateMessage={updateMessage}
              setUpdateMessage={setUpdateMessage}
              updateMessageTimeout={updateMessageTimeout}
              setUpdateMessageTimeout={setUpdateMessageTimeout}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;

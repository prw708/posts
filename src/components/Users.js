import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PostsByUser from './PostsByUser';

import { getUsers } from '../features/usersSlice';

export default function Users(props) {
  useEffect(() => {
    clearTimeout(props.updateMessageTimeout);
    props.setUpdateMessageTimeout(setTimeout(() => {
      props.setSuccessMessage('');
      props.setErrorMessage('');
    }, 3000));
  }, [props.updateMessage]);

  const dispatch = useDispatch();
  const status = useSelector((state) => state.users.status);
  const error = useSelector((state) => state.users.error);
  const users = useSelector((state) => state.users.users);

  useEffect(() => {
    dispatch(getUsers());
    window.scrollTo(0, 0);
  }, []);

  let renderedUsers;
  if (status === 'loading') {
    return (
      <React.Fragment>
        <span className="fs-1">Users</span>
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border" role="status"></div>
        </div>
      </React.Fragment>
    );
  } else if (status === 'success') {
    const sortedUsers = users.slice().sort((a, b) => {
      const nameA = a.author.toUpperCase();
      const nameB = b.author.toUpperCase();
      if (nameA > nameB) {
        return 1;
      } else if (nameA < nameB) {
        return -1;
      } else {
        return 0;
      }
    });

    renderedUsers = sortedUsers.map((user) => {
      return (
        <tr key={ user.id }>
          <td>
            <Link to={ "/projects/posts/users/" + user.author } className="link-dark text-decoration-none">{ user.author }</Link>
          </td>
          <td>
            <PostsByUser user={ user.author } />
          </td>
        </tr>
      );
    });

    return (
      <React.Fragment>
        <span className="fs-1">Users</span>
        <table className="mt-4 table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Posts</th>
            </tr>
          </thead>
          <tbody>
            { renderedUsers }
          </tbody>
        </table>
      </React.Fragment>
    );
  } else if (status === 'failed') {
    props.setSuccessMessage('');
    props.setErrorMessage('An error occurred while getting the users.');
    props.setUpdateMessage(prev => prev + 1);
    return (
      <React.Fragment>
        <span className="fs-1">Users</span>
        <p className="my-4">No users to show.</p>
      </React.Fragment>
    );
  }
  
}

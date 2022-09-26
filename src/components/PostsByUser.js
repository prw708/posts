import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getPosts } from '../features/postsSlice';

export default function PostsByUser(props) {
  const dispatch = useDispatch();
  const postsByUser = useSelector((state) => state.posts.posts.filter((post) => post.author === props.user));

  useEffect(() => {
    dispatch(getPosts());
  }, []);

  return (
    <React.Fragment>
      { postsByUser.length }
    </React.Fragment>
  );
}

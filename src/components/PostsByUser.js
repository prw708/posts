import * as React from 'react';
import { useSelector } from 'react-redux';

export default function PostsByUser(props) {
  const postsByUser = useSelector((state) => state.posts.posts.filter((post) => post.author === props.user));

  return (
    <React.Fragment>
      { postsByUser.length }
    </React.Fragment>
  );
}

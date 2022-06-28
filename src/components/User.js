import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { useParams } from 'react-router-dom';

import SearchBar from './SearchBar';
import PostList from './PostList';
import { getUserPagedPosts } from '../features/postsSlice';

export const selectPostsByUser = createSelector(
  [(state) => state.posts.posts, (state, user) => user],
  (posts, user) => posts.filter((p) => p.author === user)
);

export default function User() {
  const dispatch = useDispatch();
  let params = useParams();

  const postsByUser = useSelector((state) => selectPostsByUser(state, params.user));
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  const POST_SCROLL_ADD = 5;
  const [size, setSize] = useState(POST_SCROLL_ADD);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getUserPagedPosts({author: params.user, size}));
    }
    if (status === 'success') {
      setFilteredPostsByUser(postsByUser);
    }
  }, [status, dispatch, params.user, size, postsByUser]);

  useEffect(() => {
    dispatch(getUserPagedPosts({author: params.user, size}));
  }, [dispatch, size, params.user]);

  useEffect(() => {
    let update = null;
    let prevScroll = Math.ceil(window.scrollY);

    const debounceScroll = () => {
      return function() {
        clearTimeout(update);
        update = setTimeout(function() {
          update = null;
          handleScroll.apply(this, arguments);
        }, 1000);
      };
    };

    const handleScroll = () => {
      if (Math.ceil(window.innerHeight) + Math.ceil(window.scrollY) >= Math.ceil(document.body.scrollHeight) || 
          Math.ceil(window.innerHeight) + Math.ceil(window.pageYOffset) >= Math.ceil(document.body.scrollHeight)) {
        if (prevScroll !== Math.ceil(window.scrollY) || prevScroll !== Math.ceil(window.pageYOffset)) {
          prevScroll = (window.scrollY) ? Math.ceil(window.scrollY) : Math.ceil(window.pageYOffset);
          setSize(prev => prev + POST_SCROLL_ADD);
        }
      }
    };

    window.addEventListener("scroll", debounceScroll());
    return () => {
      window.removeEventListener("scroll", debounceScroll());
    };
  }, []);

  const [filteredPostsByUser, setFilteredPostsByUser] = useState(postsByUser);

  const onSearchBarChange = (text) => {
    setFilteredPostsByUser(
      postsByUser.filter(p => p.title.toLowerCase().includes(text.toLowerCase()))
    );
  };

  return (
    <React.Fragment>
      <span className="fs-1">{ params.user }</span>
      <SearchBar onSearchBarChange={onSearchBarChange}></SearchBar>
      <PostList status={status} posts={filteredPostsByUser} error={error}></PostList>
    </React.Fragment>
  );
}

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import SearchBar from './SearchBar';
import PostList from './PostList';
import { getPagedPosts } from '../features/postsSlice';

export default function Home() {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);

  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  const POST_SCROLL_ADD = 5;
  const [size, setSize] = useState(POST_SCROLL_ADD);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getPagedPosts({size}));
    }
    if (status === 'success') {
      setFilteredPosts(posts);
    }
  }, [status, dispatch, size, posts]);

  useEffect(() => {
    dispatch(getPagedPosts({size}));
  }, [dispatch, size]);

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

  const [filteredPosts, setFilteredPosts] = useState(posts);

  const onSearchBarChange = (text) => {
    setFilteredPosts(posts.filter(p => p.title.toLowerCase().includes(text.toLowerCase())));
  };

  return (
    <React.Fragment>
      <span className="fs-1">All Posts</span>
      <SearchBar onSearchBarChange={onSearchBarChange}></SearchBar>
      <PostList status={status} posts={filteredPosts} error={error}></PostList>
    </React.Fragment>
  );
}

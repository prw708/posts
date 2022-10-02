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

export default function User(props) {
  useEffect(() => {
    clearTimeout(props.updateMessageTimeout);
    props.setUpdateMessageTimeout(setTimeout(() => {
      props.setSuccessMessage('');
      props.setErrorMessage('');
    }, 3000));
  }, [props.updateMessage]);

  const dispatch = useDispatch();
  let params = useParams();

  const postsByUser = useSelector((state) => selectPostsByUser(state, params.user));
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  const POST_SCROLL_ADD = 5;
  const [size, setSize] = useState(POST_SCROLL_ADD);
  const [skip, setSkip] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [limitReached, setLimitReached] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [newValue, setNewValue] = useState(false);
  const [forceTextUpdate, setForceTextUpdate] = useState(0);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    if (limitReached || initial) {
      return;
    }
    if (status === 'idle') {
      dispatch(getUserPagedPosts({
        author: params.user, 
        size: size,
        skip: skip,
        searchText: searchText
      }));
    } else if (status === 'loading') {
      setNewValue(true);
    } else if (status === 'success') {
      if (!postsByUser || postsByUser.length === 0) {
        setLimitReached(true);
      }
      if (newValue) {
        setAllPosts([...allPosts, ...postsByUser]);
      }
      setNewValue(false);
    }
  }, [status, postsByUser]);

  useEffect(() => {
    let s = 0;
    if (limitReached || initial) {
      return;
    }
    if (allPosts && skip > allPosts.length) {
      s = allPosts.length;
    } else {
      s = skip;
    }
    dispatch(getUserPagedPosts({
      author: params.user, 
      size: size,
      skip: s,
      searchText: searchText
    }));
  }, [skip, forceUpdate]);

  useEffect(() => {
    if (!limitReached && Math.ceil(document.body.scrollHeight) < Math.ceil(window.innerHeight)) {
      if (status === 'loading') {
        setNewValue(true);
      } else if (status === 'success') {
        if (!postsByUser || postsByUser.length === 0) {
          setLimitReached(true);
        }
        if (newValue) {
          setAllPosts([...allPosts, ...postsByUser]);
          dispatch(getUserPagedPosts({
            author: params.user,
            size: size,
            skip: skip + POST_SCROLL_ADD,
            searchText: searchText
          }));
          setSkip(prev => prev + POST_SCROLL_ADD);
        }
        setNewValue(false);
      }
    } else {
      setInitial(false);
    }
  }, [status]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let update = null;

    if (Math.ceil(document.body.scrollHeight) < Math.ceil(window.innerHeight)) {
      dispatch(getUserPagedPosts({
        author: params.user,
        size: size,
        skip: skip,
        searchText: searchText
      }));
      setSkip(prev => prev + POST_SCROLL_ADD);
    }

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
      if (status === 'loading') {
        return false;
      }
      if (Math.ceil(window.innerHeight) + Math.ceil(window.scrollY) >= Math.ceil(document.body.scrollHeight) || 
          Math.ceil(window.innerHeight) + Math.ceil(window.pageYOffset) >= Math.ceil(document.body.scrollHeight)) {
        setSkip(prev => prev + POST_SCROLL_ADD);
      }
    };

    window.addEventListener("scroll", debounceScroll());
    return () => {
      window.removeEventListener("scroll", debounceScroll());
    };
  }, []);

  useEffect(() => {
    setAllPosts([]);
    setLimitReached(false);
    setSkip(0);
    setForceUpdate(prev => prev + 1);
  }, [forceTextUpdate]);

  const onSearchBarChange = (text, valid) => {
    if (valid) {
      setSearchText(text);
      setLimitReached(false);
      props.setUpdateMessage(prev => prev + 1);
      setForceTextUpdate(prev => prev + 1);
    } else {
      setAllPosts([]);
      setLimitReached(true);
      props.setSuccessMessage('');
      props.setErrorMessage('There is an error in the Search Bar.');
      props.setUpdateMessage(prev => prev + 1);
    }
  };

  return (
    <React.Fragment>
      <span className="fs-1">{ params.user }</span>
      <SearchBar 
        searchText={searchText}
        onSearchBarChange={onSearchBarChange}
      ></SearchBar>
      <PostList 
        status={status} 
        posts={allPosts} 
      ></PostList>
    </React.Fragment>
  );
}

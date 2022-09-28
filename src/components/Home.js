import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import SearchBar from './SearchBar';
import PostList from './PostList';
import { getPagedPosts } from '../features/postsSlice';

export default function Home(props) {
  useEffect(() => {
    clearTimeout(props.updateMessageTimeout);
    props.setUpdateMessageTimeout(setTimeout(() => {
      props.setSuccessMessage('');
      props.setErrorMessage('');
    }, 3000));
  }, [props.updateMessage]);

  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);

  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  const POST_SCROLL_ADD = 5;
  const [size, setSize] = useState(POST_SCROLL_ADD);
  const [skip, setSkip] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [limitReached, setLimitReached] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [newValue, setNewValue] = useState(true);
  const [forceTextUpdate, setForceTextUpdate] = useState(false);

  useEffect(() => {
    if (limitReached) {
      return;
    }
    if (status === 'idle') {
      dispatch(getPagedPosts({
        size: size,
        skip: skip,
        searchText: searchText
      }));
    }
    if (status === 'loading') {
      setNewValue(true);
    }
    if (status === 'success') {
      if (!posts || posts.length === 0) {
        setLimitReached(true);
      }
      if (newValue) {
        setAllPosts([...allPosts, ...posts]);
      }
      setNewValue(false);
    }
  }, [status, posts]);

  useEffect(() => {
    if (limitReached) {
      return;
    }
    dispatch(getPagedPosts({
      size: size,
      skip: skip,
      searchText: searchText
    }));
  }, [skip, forceUpdate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let update = null;

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
    setForceUpdate(!forceUpdate);
  }, [forceTextUpdate]);

  const onSearchBarChange = (text, valid) => {
    if (valid) {
      setSearchText(text);
      props.setUpdateMessage(!props.updateMessage);
      setForceTextUpdate(!forceTextUpdate);
    } else {
      setAllPosts([]);
      setLimitReached(false);
      props.setSuccessMessage('');
      props.setErrorMessage('There is an error in the Search Bar.');
      props.setUpdateMessage(!props.updateMessage);
    }
  };

  return (
    <React.Fragment>
      <span className="fs-1">All Posts</span>
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

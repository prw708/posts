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
  const [forceUpdate, setForceUpdate] = useState(0);
  const [newValue, setNewValue] = useState(false);
  const [forceTextUpdate, setForceTextUpdate] = useState(0);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    if (limitReached) {
      return;
    }
    if (Math.ceil(document.body.scrollHeight) <= Math.ceil(window.innerHeight)) {
      if (status === 'loading') {
        setNewValue(true);
      } else if (status === 'success') {
        if (!posts || posts.length === 0) {
          setLimitReached(true);
        } else {
          if (newValue) {
            setAllPosts([...allPosts, ...posts]);
            setTimeout(() => {
              if (Math.ceil(document.body.scrollHeight) > Math.ceil(window.innerHeight)) {
                setInitial(false);
                return;
              }
              dispatch(getPagedPosts({
                size: size,
                skip: skip,
                searchText: searchText
              }));
              setSkip(prev => prev + POST_SCROLL_ADD);
            }, 750);
          }
        }
        setNewValue(false);
      }
    } else {
      if (initial) {
        setNewValue(true);
      }
      setInitial(false);
    }
  }, [status]);

  useEffect(() => {
    if (limitReached || initial) {
      return;
    }
    if (status === 'loading') {
      setNewValue(true);
    } else if (status === 'success') {
      if (!posts || posts.length === 0) {
        setLimitReached(true);
      } else {
        if (newValue) {
          setAllPosts([...allPosts, ...posts]);
        }
      }
      setNewValue(false);
    }
  }, [status, posts]);

  useEffect(() => {
    if (limitReached || initial) {
      return;
    }
    let s = 0;
    if (allPosts && skip > allPosts.length) {
      s = allPosts.length;
    } else {
      s = skip;
    }
    dispatch(getPagedPosts({
      size: size,
      skip: s,
      searchText: searchText
    }));
  }, [skip]);

  useEffect(() => {
    dispatch(getPagedPosts({
      size: size,
      skip: 0,
      searchText: searchText
    }));
    setSkip(prev => prev + POST_SCROLL_ADD);
  }, [forceUpdate]);

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
      let divHeight = Math.ceil(window.pageYOffset + document.getElementById("root").getBoundingClientRect().top) + 
        Math.ceil(document.getElementById("root").scrollHeight);
      if ((Math.ceil(window.innerHeight) + Math.ceil(window.scrollY) >= divHeight) || 
          (Math.ceil(window.innerHeight) + Math.ceil(window.pageYOffset) >= divHeight)) {
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
    setInitial(true);
    setLimitReached(false);
    setSkip(0);
    setForceUpdate(prev => prev + 1);
  }, [forceTextUpdate]);

  const handleSearchBarChange = (text, valid) => {
    if (valid) {
      setSearchText(text);
      setLimitReached(false);
      props.setUpdateMessage(prev => prev + 1);
      setForceTextUpdate(prev => prev + 1);
      props.setSuccessMessage('');
      props.setErrorMessage('');
      props.setUpdateMessage(prev => prev + 1);
    } else {
      setAllPosts([]);
      setInitial(true);
      setLimitReached(true);
      props.setSuccessMessage('');
      props.setErrorMessage('There is an error in the Search Bar.');
      props.setUpdateMessage(prev => prev + 1);
    }
  };

  return (
    <React.Fragment>
      <span className="fs-1">All Posts</span>
      <SearchBar 
        searchText={searchText}
        onSearchBarChange={handleSearchBarChange}
      ></SearchBar>
      <PostList 
        status={status} 
        posts={allPosts} 
      ></PostList>
    </React.Fragment>
  );
}

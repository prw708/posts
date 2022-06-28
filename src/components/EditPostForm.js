import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { getPosts, updatePost } from '../features/postsSlice';

export const EditPostForm = (props) => {
  const params = useParams();
  const postId = params.postId;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editStatus, setEditStatus] = useState('idle');
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  const [title, setTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const post = useSelector((state) => {
    return state.posts.posts.find((p) => p.id === postId);
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getPosts());
    }
    if (status === 'success' && post) {
      setTitle(post.title);
      setPostContent(post.post);
    }
  }, [status, dispatch, post]);

  const onTitleChanged = (e) => setTitle(e.target.value);
  const onPostChanged = (e) => setPostContent(e.target.value);

  const disabledEditClick = editStatus === 'idle' ? false : true;

  const [titleValid, setTitleValid] = useState(true);
  const [postValid, setPostValid] = useState(true);
  const [invalidEditPostMessage, setInvalidEditPostMessage] = useState('');
  const validate = () => {
    let titleValidity = false, postValidity = false;
    if (/^[A-Za-z0-9 _!.,?-]+$/.test(title) && title.length <= 100) {
      setTitleValid(true);
      titleValidity = true;
    } else {
      setTitleValid(false);
      titleValidity = false;
    }
    if (/^[A-Za-z0-9 _!.,?\s-]+$/.test(postContent) && postContent.length <= 200) {
      setPostValid(true);
      postValidity = true;
    } else {
      setPostValid(false);
      postValidity = false;
    }
    return titleValidity && postValidity;
  };

  const onEditClick = async (e) => {
    e.preventDefault();
    setInvalidEditPostMessage('');
    if (validate() && !disabledEditClick) {
      setEditStatus('pending');
      window.grecaptcha.ready(function() {
        window.grecaptcha.execute(props.recaptchaSiteKey, { action: 'update' })
        .then(async function(recaptchaToken) {
          await dispatch(updatePost({ 
            id: postId, 
            title, 
            post: postContent, 
            author: props.username, 
            csrfToken: props.csrfToken,
            time: props.time,
            'g-recaptcha-response': recaptchaToken
          })).unwrap();
          setEditStatus('idle');
          navigate("/projects/posts/" + post.id);
        })
        .catch(function(error) {
          for (const e of error) {
            if (e.param === 'title') {
              setTitleValid(false);
            } else if (e.param === 'post') {
              setPostValid(false);
            } else if (e.param === 'editPostMessage') {
              setInvalidEditPostMessage(e.msg);
            }
          }
          setEditStatus('idle');
        });
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center mt-4">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  } else if (status === 'success' || status === 'failed') {
    if (!props.username) {
      return (<React.Fragment>
        <span className="fs-1">Edit Post</span>
        <div className="alert alert-info mt-4 px-4">You must be <a href="/website/account/login" className="link-dark">logged in</a> to edit a post.</div>
      </React.Fragment>);
    } else if (title === '' || postContent === '' || !post.author) {
      return (<React.Fragment>
        <span className="fs-1">Edit Post</span>
        <div className="alert alert-danger mt-4 px-4">Post not found!</div>
      </React.Fragment>);
    } else if (props.username !== post.author) {
      return (<React.Fragment>
        <span className="fs-1">Edit Post</span>
        <div className="alert alert-danger mt-4 px-4">This is not your post!</div>
      </React.Fragment>);
    }
    return (
      <React.Fragment>
        <span className="fs-1">Edit Post</span>
        <form className="mt-4">
          { error && invalidEditPostMessage && 
            <div className="alert alert-danger px-4 mb-4">{ invalidEditPostMessage }</div>
          }
          <div className="mb-4">
            <label htmlFor="epTitle" className="form-label">Title</label>
            <input 
              type="text" 
              id="epTitle" 
              className={titleValid ? "form-control" : "form-control is-invalid"}
              value={title}
              onChange={onTitleChanged}
            />
            { !titleValid && 
              <div className="invalid-feedback">Title can only contain valid characters and must be less than 100 characters.</div>
            }
          </div>
          <div className="mb-4">
            <label htmlFor="epPost" className="form-label">Post</label>
            <textarea 
              id="epPost" 
              className={postValid ? "form-control overflow-auto" : "form-control is-invalid overflow-auto"}
              rows="3"
              value={postContent}
              onChange={onPostChanged}
            ></textarea>
            { !postValid && 
              <div className="invalid-feedback">Post can only contain valid characters and must be less than 200 characters.</div>
            }
          </div>
          <div className="mb-0">
            <button
              type="submit"
              className="btn btn-secondary"
              onClick={onEditClick}
              disabled={disabledEditClick}
            >Edit Post</button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

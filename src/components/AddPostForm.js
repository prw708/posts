import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { addNewPost } from '../features/postsSlice';

export const AddPostForm = (props) => {
  useEffect(() => {
    props.setSuccessMessage('');
    props.setErrorMessage('');
  }, []);

  const [title, setTitle] = useState('');
  const [post, setPost] = useState('');
  const [addStatus, setAddStatus] = useState('idle');

  const status = useSelector((state) => {
    props.setStatus(state.posts.status);
    return state.posts.status;
  });
  const error = useSelector((state) => state.posts.error);

  const onTitleChanged = (e) => setTitle(e.target.value);
  const onPostChanged = (e) => setPost(e.target.value);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const disabledPostClick = addStatus === 'idle' ? false : true;

  const [titleValid, setTitleValid] = useState(true);
  const [postValid, setPostValid] = useState(true);
  const [invalidAddPostMessage, setInvalidAddPostMessage] = useState('');
  const validate = () => {
    let titleValidity = false, postValidity = false;
    if (/^[A-Za-z0-9 _!.,?"'-]+$/.test(title) && title.length <= 100) {
      setTitleValid(true);
      titleValidity = true;
    } else {
      setTitleValid(false);
      titleValidity = false;
    }
    if (/^[A-Za-z0-9 _!.,?"'\s-]+$/.test(post) && post.length <= 200) {
      setPostValid(true);
      postValidity = true;
    } else {
      setPostValid(false);
      postValidity = false;
    }
    return titleValidity && postValidity;
  }

  const onPostClick = async (e) => {
    e.preventDefault();
    setInvalidAddPostMessage('');
    if (validate() && !disabledPostClick) {
      setAddStatus('pending');
      window.grecaptcha.ready(function() {
        window.grecaptcha.execute(props.recaptchaSiteKey, { action: 'add' })
        .then(async function(recaptchaToken) {
          const posted = await dispatch(addNewPost({ 
            title, 
            post, 
            author: props.username, 
            csrfToken: props.csrfToken,
            time: props.time,
            'g-recaptcha-response': recaptchaToken
          })).unwrap();
          setTitle('');
          setPost('');
          props.setSuccessMessage('Post added successfully!');
          props.setErrorMessage('');
          setAddStatus('idle');
          navigate("/projects/posts/" + posted.id);
        })
        .catch(function(error) {
          props.setSuccessMessage('');
          setAddStatus('idle');
          if (!error || error.length === 0) {
            props.setErrorMessage('An error occurred adding the post.');
          } else {
            for (const e of error) {
              if (e.param === 'title') {
                setTitleValid(false);
              } else if (e.param === 'post') {
                setPostValid(false);
              } else if (e.param === 'addPostMessage') {
                setInvalidAddPostMessage(e.msg);
              }
            }
            props.setErrorMessage('There are errors in the Add Post form.');
          }
        });
      });
    } else {
      props.setSuccessMessage('');
      props.setErrorMessage('There are errors in the Add Post form.');
      setAddStatus('idle');
    }
  };

  if (!props.username) {
    props.setSuccessMessage('');
    props.setErrorMessage('You must be logged in to add posts.');
    return (<React.Fragment>
      <span className="fs-1">Add Post</span>
      <div className="alert alert-info mt-4 px-4">You must be <a href="/website/account/login" className="link-dark">logged in</a> to add a post.</div>
    </React.Fragment>);
  } else if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center mt-4">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  } else if (status === 'idle' || status === 'success' || status === 'failed') {
    return (
      <React.Fragment>
        <span className="fs-1">Add Post</span>
        <form className="mt-4">
          { status === 'failed' && invalidAddPostMessage && 
            <div className="alert alert-danger px-4 mb-4">{ invalidAddPostMessage }</div>
          }
          <div className="mb-4">
            <label htmlFor="apTitle" className="form-label">Title</label>
            <input 
              type="text" 
              id="apTitle" 
              className={titleValid ? "form-control" : "form-control is-invalid"}
              value={title}
              onChange={onTitleChanged}
              maxLength="100"
              autoComplete="off"
            />
            { !titleValid && 
              <div className="invalid-feedback">Title can only contain valid characters and must be less than 100 characters.</div>
            }
          </div>
          <div className="mb-4">
            <label htmlFor="apPost" className="form-label">Post</label>
            <textarea 
              id="apPost" 
              className={postValid ? "form-control overflow-auto" : "form-control is-invalid overflow-auto"}
              rows="3"
              value={post}
              onChange={onPostChanged}
              maxLength="200"
              autoComplete="off"
            ></textarea>
            { !postValid && 
              <div className="invalid-feedback">Post can only contain valid characters and must be less than 200 characters.</div>
            }
          </div>
          <div className="mb-0">
            <button
              type="submit"
              className="btn btn-secondary"
              onClick={onPostClick}
              disabled={disabledPostClick}
            >Post</button>
          </div>
        </form>
      </React.Fragment>
    );
  }

}

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Link, useParams, useNavigate } from 'react-router-dom';
import { TimeAgo } from './TimeAgo';

import { getPosts, addComment, deleteComment, deletePost } from '../features/postsSlice';

export default function Post(props) {
  useEffect(() => {
    if (props.status !== 'success') {
      props.setSuccessMessage('');
      props.setErrorMessage('');
    } else {
      props.setErrorMessage('');
    }
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const params = useParams();
  const postId = params.postId;

  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getPosts());
    }
  }, [status, dispatch]);

  const post = useSelector((state) => {
    return state.posts.posts.find((p) => p.id === postId);
  });
  const [threadId, setThreadId] = useState(-1);
  const [comment, setComment] = useState('');
  const [commentStatus, setCommentStatus] = useState('idle');

  const onCommentChanged = (e) => setComment(e.target.value);

  const [commentValid, setCommentValid] = useState(true);
  const [invalidAddCommentMessage, setInvalidAddCommentMessage] = useState('');
  const [invalidDeleteCommentMessage, setInvalidDeleteCommentMessage] = useState('');
  const [invalidDeletePostMessage, setInvalidDeletePostMessage] = useState('');
  const comments = useSelector((state) => {
    const selectedPost = state.posts.posts.find((p) => {
      if (p.id === postId) {
        return p;
      } else {
        return null;
      }
    });
    if (selectedPost) {
      return selectedPost.comments;
    } else {
      return [];
    }
  });

  const onReplyClick = (e, threadId) => {
    e.preventDefault();
    setThreadId(threadId);
  };

  const onDeleteCommentClick = async (e, threadId, commentId) => {
    e.preventDefault();
    setCommentValid(true);
    setInvalidDeletePostMessage('');
    setInvalidAddCommentMessage('');
    setInvalidDeleteCommentMessage('');
    window.grecaptcha.ready(function() {
      window.grecaptcha.execute(props.recaptchaSiteKey, { action: 'deleteComment' })
      .then(async function(recaptchaToken) {
        await dispatch(deleteComment({ 
          id: postId, 
          author: props.username, 
          threadId, 
          commentId, 
          csrfToken: props.csrfToken,
          time: props.time,
          'g-recaptcha-response': recaptchaToken
        })).unwrap();
        setThreadId(-1);
        props.setSuccessMessage('Comment deleted successfully!');
        props.setErrorMessage('');
      })
      .catch(function(error) {
        props.setSuccessMessage('');
        if (!error || error.length === 0) {
          props.setErrorMessage('An error occurred while deleting the comment.');
        } else {
          for (const e of error) {
            if (e.param === 'deleteCommentMessage') {
              setInvalidDeleteCommentMessage(e.msg);
            }
          }
          props.setErrorMessage('An error occurred while deleting the comment.');
        }
      });
    });
  };

  const onNewThreadClick = () => {
    setThreadId(-1);
  };

  const onDeleteClick = async (e) => {
    e.preventDefault();
    setCommentValid(true);
    setInvalidDeletePostMessage('');
    setInvalidAddCommentMessage('');
    setInvalidDeleteCommentMessage('');
    window.grecaptcha.ready(function() {
      window.grecaptcha.execute(props.recaptchaSiteKey, { action: 'delete' })
      .then(async function(recaptchaToken) {
        await dispatch(deletePost({ 
          id: postId, 
          author: props.username, 
          csrfToken: props.csrfToken,
          time: props.time,
          'g-recaptcha-response': recaptchaToken
        })).unwrap();
        props.setSuccessMessage('Post deleted successfully!');
        props.setErrorMessage('');
        navigate("/projects/posts");
      })
      .catch(function(error) {
        props.setSuccessMessage('');
        if (!error || error.length === 0) {
          props.setErrorMessage('An error occurred while deleting the post.');
        } else {
          for (const e of error) {
            if (e.param === 'deletePostMessage') {
              setInvalidDeletePostMessage(e.msg);
            }
          }
          props.setErrorMessage('An error occurred while deleting the post.');
        }
      });
    });
  };

  const disabledCommentClick = commentStatus === 'idle' ? false : true;

  const onCommentClick = async (e) => {
    e.preventDefault();
    setInvalidDeletePostMessage('');
    setInvalidAddCommentMessage('');
    setInvalidDeleteCommentMessage('');
    if (validate() && !disabledCommentClick) {
      window.grecaptcha.ready(function() {
        window.grecaptcha.execute(props.recaptchaSiteKey, { action: 'addComment' })
        .then(async function(recaptchaToken) {
          setCommentStatus('pending');
          await dispatch(addComment({ 
            id: postId, 
            author: props.username, 
            comment, 
            threadId, 
            csrfToken: props.csrfToken,
            time: props.time,
            'g-recaptcha-response': recaptchaToken
          })).unwrap();
          setComment('');
          setCommentStatus('idle');
          props.setSuccessMessage('Comment posted successfully!');
          props.setErrorMessage('');
        })
        .catch(function(error) {
          props.setSuccessMessage('');
          if (!error || error.length === 0) {
            props.setErrorMessage('An error occurred while adding the comment.');
          } else {
            for (const e of error) {
              if (e.param === 'comment') {
                setCommentValid(false);
              } else if (e.param === 'addCommentMessage') {
                setInvalidAddCommentMessage(e.msg);
              }
            }
            props.setErrorMessage('An error occurred while adding the comment.');
          }
          setCommentStatus('idle');
        });
      });
    } else {
      props.setSuccessMessage('');
      props.setErrorMessage('There are errors in the Comment form.');
    }
  };

  const validate = () => {
    let commentValidity = false;
    if (/^[A-Za-z0-9 !.,?"'\s\-]+$/.test(comment) && comment.length < 200) {
      setCommentValid(true);
      commentValidity = true;
    } else {
      setCommentValid(false);
      commentValidity = false;
    }
    return commentValidity;
  };

  let renderedComments = [];

  renderedComments = comments.map((thread, threadIndex) => {
    return thread.map((comment, commentIndex) => {
      return <div key={ comment.id } className={ commentIndex === 0 ? "card mb-4" : "card mb-4 ms-4" }>
        <div className="card-body position-relative">
          <div className="position-absolute top-0 end-0 m-3">
            <button
              type="button"
              className="btn btn-link btn-sm link-dark p-0"
              onClick={(e) => onReplyClick(e, threadIndex)}
            >Reply</button>
            { comment.author === props.username && 
              <button 
                type="button"
                className="btn btn-link btn-sm link-dark p-0 ms-3"
                onClick={(e) => onDeleteCommentClick(e, threadIndex, commentIndex)}
              >Delete</button>
            }
          </div>
          <h6 className="card-title">Thread #{ threadIndex + 1 }</h6>
          <p className="preserve-white-space mb-0">{ comment.comment }</p>
        </div>
        <div className="card-footer">
          <small className="text-muted">
            { comment.author }
            <TimeAgo timestamp={ comment.date } />
          </small>
        </div>
      </div>;
    });
  });

  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center mt-4">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  } else if (status !== 'idle' && !post) {
    return <React.Fragment>
      <span className="fs-1">Post</span>
      <div className="alert alert-danger mt-4 px-4">Post not found!</div>
    </React.Fragment>
  } else if (status === 'success' || status === 'failed') {
    return (
      <article key={ post.id }>
        <span className="fs-1">{ post.title }</span>
        <h6 className="mt-1 mb-3">
          <Link to={"/projects/posts/users/" + post.author } className="link-dark text-decoration-none">{ post.author }</Link>
          <TimeAgo timestamp={ post.date } /></h6>
        <p className="preserve-white-space mb-4">{ post.post }</p>
        { props.username === post.author && <div className="mb-4">
          <Link to={"/projects/posts/edit/" + post.id } className="btn btn-secondary">Edit</Link>
          <button 
            type="button"
            className="btn btn-danger ms-2"
            onClick={onDeleteClick}
          >Delete</button>
        </div>
        }
        <div className="mb-4">
          <span className="fs-4">Discussion ({ renderedComments.reduce((curr, row) => curr + row.length, 0) })</span>
        </div>
        { renderedComments }
        { !props.username && 
          <div className="alert alert-info px-4 mt-4">
            You must be <a href="/website/account/login" className="link-dark">logged in</a> to comment.
          </div>
        }
        { props.username && 
          <form>
            <div className="mb-4">
              <div className="float-end">
                <button
                  type="button"
                  className="btn btn-link btn-sm small link-dark p-0"
                  onClick={onNewThreadClick}
                >New Thread</button>
              </div>
              <label htmlFor="pComment" className="form-label">
                Comment <small className="text-muted ms-3">{ threadId !== -1 ? "Replying to #" + (threadId + 1) : "" }</small>
              </label>
              <textarea 
                id="pComment" 
                className={commentValid ? "form-control overflow-auto" : "form-control is-invalid overflow-auto"}
                rows="3"
                value={comment}
                onChange={onCommentChanged}
                maxLength="200"
                autoComplete="off"
              ></textarea>
              { !commentValid && 
                <div className="invalid-feedback">Comment can only contain valid characters and must be less than 200 characters.</div>
              }
            </div>
            <div className="mb-0">
              <button
                type="submit"
                className="btn btn-secondary"
                onClick={onCommentClick}
                disabled={disabledCommentClick}
              >Comment</button>
            </div>
          </form>
        }
      </article>
    );
  }
}

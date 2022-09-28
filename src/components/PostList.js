import React from 'react';
import { Link } from 'react-router-dom';
import { TimeAgo } from './TimeAgo';
import { parseISO, compareDesc } from 'date-fns';

export default function PostList(props) {
  let renderedPosts;

  if (props.status === 'success' || props.status === 'loading') {
    let orderedPosts = props.posts.slice().sort((a, b) => {
      return compareDesc(parseISO(a.date), parseISO(b.date));
    });
    
    renderedPosts = orderedPosts.map((post) => {
      return <article className="pt-4 px-4 border-bottom" key={ post.id }>
        <h3 className="mb-1">
          <Link to={ "/projects/posts/" + post.id } className="link-dark text-decoration-none">{ post.title }</Link>
        </h3>
        <h6 className="mb-3">
          <Link to={ "/projects/posts/users/" + post.author } className="link-dark text-decoration-none">{ post.author }</Link>
          <TimeAgo timestamp={ post.date } /></h6>
        <p className="preserve-white-space mb-4">{ post.post.substring(0, 100) }</p>
      </article>;
    });
  } else if (props.status === 'failed') {
    renderedPosts = null;
  }

  if ((!renderedPosts || renderedPosts.length === 0) && props.status !== 'loading' && props.status !== 'idle') {
    renderedPosts = <p className="my-4">No posts to show.</p>;
  }

  return (
    <section className={ renderedPosts && renderedPosts.length > 0 ? "mt-4 border-top" : "" }>
      { renderedPosts }
      { props.status === 'loading' && 
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border" role="status"></div>
        </div>
      }
    </section>
  );
}

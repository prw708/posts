import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(props) {
  return (
    <React.Fragment>
      <span className="fs-1">Not Found</span>
      <div className="mt-4">
        <Link to={"/projects/posts"} className="link-dark">Return</Link>
      </div>
    </React.Fragment>
  );
}

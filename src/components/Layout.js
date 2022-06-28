import * as React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout(props) {
  let location = useLocation();
  
  return (
    <React.Fragment>
      <div className="row g-0">
        <nav className="d-flex flex-column flex-shrink-0 p-4 bg-light col-sm-5 col-md-4 col-lg-3">
          <Link to="/projects/posts" className="d-flex align-items-center mb-0 me-md-auto link-dark text-decoration-none">
            <span className="fs-4">Actions</span>
          </Link>
          <hr className="link-dark" />
          <ul className="nav nav-pills flex-column mb-4">
            <li className="nav-item">
              <Link to="/projects/posts" 
                className={ location.pathname === "/projects/posts" ? "nav-link active" : "nav-link link-dark"}
              >All Posts</Link>
            </li>
            <li className="nav-item">
              <Link to="/projects/posts/add" 
                className={ location.pathname === "/projects/posts/add" ? "nav-link active" : "nav-link link-dark"}
              >Add Post</Link>
            </li>
            <li className="nav-item">
              <Link to="/projects/posts/users" 
                className={ location.pathname === "/projects/posts/users" ? "nav-link active" : "nav-link link-dark"}
              >Users</Link>
            </li>
          </ul>
          <span className="link-dark fs-4">Account</span>
          <hr className="link-dark" />
          { props.username && 
            <form method="POST" action="/website/account/logout">
              <input type="hidden" name="_csrf" value={props.csrfToken} />
              <input type="hidden" name="time" value={props.time} />
              <button 
                  type="submit"
                  name="logout"
                  value="true"
                  className="nav-link link-dark bg-transparent w-100 border-0 text-start">Logout</button>
            </form>
          }
          { !props.username && 
            <a href="/website/account/login" className="nav-link link-dark">Login</a>
          }
        </nav>
        <div className="col-sm-7 col-md-8 col-lg-9 p-4">
          <Outlet />
        </div>
      </div>
    </React.Fragment>
  );
}

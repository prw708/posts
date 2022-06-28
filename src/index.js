import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './app/store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
const username = document.getElementById('root').dataset.username;
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const time = document.querySelector('meta[name="time-of-load"]').getAttribute('content');
const recaptchaSiteKey = document.getElementById('root').dataset.recaptchasitekey;
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App 
        username={username} 
        csrfToken={csrfToken} 
        time={time}
        recaptchaSiteKey={recaptchaSiteKey}
      />
    </Provider>
  </React.StrictMode>
);


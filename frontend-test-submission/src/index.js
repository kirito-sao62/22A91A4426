import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


import { init as initLogger } from 'logging-middleware';


import { AUTH_TOKEN } from './config';


initLogger(AUTH_TOKEN);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
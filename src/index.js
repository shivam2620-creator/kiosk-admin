import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './Utils/AuthContext';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

import { store } from './Redux/store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
   <Provider store={store}>
 
    <AuthProvider>
      <App />
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  
    </Provider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

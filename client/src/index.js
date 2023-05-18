import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from './ErrorPage';
import SignUpUser from './SignUpUser';
import LogInUser from './LogInUser';
import BalanceDetails from './BalanceDetails';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement: <ErrorPage/>,
  },
  {
    path: "/signup",
    element: <SignUpUser/>,
    errorElement: <ErrorPage/>,
  },
  {
    path: "/login",
    element: <LogInUser/>,
    errorElement: <ErrorPage/>,
  },
  {
    path: "/balances/:id",
    element: <BalanceDetails/>,
    errorElement: <ErrorPage/>,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode className='body'>
    <RouterProvider  router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

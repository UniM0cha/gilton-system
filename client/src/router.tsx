import React from 'react';
import type { RouteObject } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Worship from './pages/Worship';

export const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/worship', element: <Worship /> },
  { path: '/admin', element: <Admin /> }
];

export const createRouter = () =>
  require('react-router-dom').createBrowserRouter(routes);

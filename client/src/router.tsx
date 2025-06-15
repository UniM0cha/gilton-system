import React from 'react';
import type { RouteObject } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

export const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/admin', element: <Admin /> }
];

// 라우터 생성을 별도로 수행하도록 함수로 노출
export const createRouter = () =>
  require('react-router-dom').createBrowserRouter(routes);


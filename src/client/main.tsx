import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import pages
import HomePage from './pages/HomePage';
import WorshipPage from './pages/WorshipPage';
import SetupPage from './pages/SetupPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';

// Import global styles
import './styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient();

// Create router
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/worship',
    element: <WorshipPage />
  },
  {
    path: '/setup',
    element: <SetupPage />
  },
  {
    path: '/admin',
    element: <AdminPage />
  }
]);

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { theme } from './theme';
import { AuthProvider } from './auth/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import { InternalNotesProvider } from './context/InternalNotesContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Caseload from './pages/Caseload';
import MemberProfile from './pages/MemberProfile';
import Inbox from './pages/Inbox';
import InternalNotes from './pages/InternalNotes';
import CalendarPage from './pages/CalendarPage';
import Reports from './pages/Reports';
import './index.css';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'caseload', element: <Caseload /> },
      { path: 'members/:id', element: <MemberProfile /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'internal-notes', element: <InternalNotes /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <MessagesProvider>
            <InternalNotesProvider>
              <RouterProvider router={router} />
            </InternalNotesProvider>
          </MessagesProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
);

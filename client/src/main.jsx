import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import 'material-symbols/outlined.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import Rounds from './pages/Rounds.jsx'
import Rapidfire from './pages/Rapidfire.jsx'
import Cascade from './pages/Cascade.jsx'
import DSA from './pages/DSA.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import { loader } from '@monaco-editor/react';
import './index.css'

// Configure Monaco Editor to load local vs directory files instead of CDN
loader.config({ paths: { vs: `${import.meta.env.BASE_URL}node_modules/monaco-editor/min/vs` } });
import RapidfireContest from './pages/RapidfireContest.jsx'
import ProtectedContestRoute from './components/ProtectedContestRoute.jsx'
import CascadeContest from './pages/CascadeContest.jsx'
import ProtectedCascadeRoute from './components/ProtectedCascadeRoute.jsx'
import DSAContest from './pages/DSAContest.jsx'
import ProtectedDSARoute from './components/ProtectedDSARoute.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminQuestions from './pages/AdminQuestions.jsx'

const router = createBrowserRouter([
    {
        path: "/",
        element: <Rounds />
    },
    {
        path: "/app",
        element: <App />
    },
    {
        path: "/rounds",
        element: <Rounds />
    },
    {
        path: "/rapidfire",
        element: <Rapidfire />
    },
    {
        path: "/rapidfire-contest",
        element: <ProtectedContestRoute><RapidfireContest /></ProtectedContestRoute>
    },
    {
        path: "/cascade",
        element: <Cascade />
    },
    {
        path: "/cascade-contest",
        element: <ProtectedCascadeRoute><CascadeContest /></ProtectedCascadeRoute>
    },
    {
        path: "/dsa",
        element: <DSA />
    },
    {
        path: "/dsa-contest",
        element: <ProtectedDSARoute><DSAContest /></ProtectedDSARoute>
    },
    {
        path: "/leaderboard",
        element: <Leaderboard />
    },
    {
        path: "/admin/login",
        element: <AdminLogin />
    },
    {
        path: "/admin/dashboard",
        element: <AdminDashboard />
    },
    {
        path: "/admin/questions",
        element: <AdminQuestions />
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import App from './App.jsx'
import Rounds from './pages/Rounds.jsx'
import Rapidfire from './pages/Rapidfire.jsx'
import Cascade from './pages/Cascade.jsx'
import DSA from './pages/DSA.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import './index.css'

const router = createBrowserRouter([
  {
    path:"/",
    element:<App/>
  },
  {
    path:"/rounds",
    element:<Rounds/>
  },
  {
    path:"/rapidfire",
    element:<Rapidfire/>
  },
  {
    path:"/cascade",
    element:<Cascade/>
  },
  {
    path:"/dsa",
    element:<DSA/>
  },
  {
    path:"/leaderboard",
    element:<Leaderboard/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)


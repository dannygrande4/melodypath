import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// VITE_BASE_PATH controls both Vite asset base and React Router basename.
// Dev: /music  |  Own domain (future): /
const basePath = import.meta.env.VITE_BASE_PATH ?? '/music'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

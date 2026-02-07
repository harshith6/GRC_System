import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Get the root element from the HTML
const rootElement = document.getElementById('root')

// Create a React root and render the App component
ReactDOM.createRoot(rootElement).render(
  // StrictMode helps identify potential problems in the app
  // It activates additional checks and warnings for descendants
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

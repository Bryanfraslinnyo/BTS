import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/App.js'
import '../src/css/globals.css'
import '../src/css/variables.css'
import '../src/css/components.css'
import '../src/css/login.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


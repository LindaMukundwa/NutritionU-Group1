import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Dashboard from './Dashboard'; // Import your Dashboard component

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<></>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

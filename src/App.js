// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HistoryPage from "./pages/history";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/history" />} />
        <Route path="/history" element={<HistoryPage />} />
        {/* Tu peux rajouter d'autres routes ici plus tard */}
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HistoryPage from "./features/salvage/pages/HistoryPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/history" />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
}

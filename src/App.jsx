import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/auth/Login.jsx";
import Register from "@/pages/auth/Register.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <main>
          <Routes>
            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AuthorityProvider } from "@/context/AuthorityContext";
import { OfficerProvider } from "@/context/OfficerContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AuthorityProvider>
        <OfficerProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </OfficerProvider>
      </AuthorityProvider>
    </AuthProvider>
  );
}

export default AppProviders;

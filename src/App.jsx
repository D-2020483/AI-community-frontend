import React from "react";
import { AppProviders } from "@/app/providers";
import AppRoutes from "@/app/routes";

function App() {
  return (
    <AppProviders>
      <main>
        <AppRoutes />
      </main>
    </AppProviders>
  );
}

export default App;

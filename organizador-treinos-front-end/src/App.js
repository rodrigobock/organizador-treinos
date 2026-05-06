import React from "react";
import RoutesApp from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/theme";
import GlobalStyle from "./styles/global";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <RoutesApp />
      <GlobalStyle />
    </AuthProvider>
  </ThemeProvider>
);

export default App;

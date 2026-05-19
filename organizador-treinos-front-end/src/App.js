import React, { Suspense } from "react";
import RoutesApp from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/theme";
import { LanguageProvider } from "./contexts/language";
import GlobalStyle from "./styles/global";

const App = () => (
  <Suspense fallback={null}>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <RoutesApp />
          <GlobalStyle />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </Suspense>
);

export default App;

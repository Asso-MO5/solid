// @refresh reload
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, type ParentProps, Suspense } from "solid-js";
import "./app.css";

function RootLayout(props: ParentProps) {
  return (
    <MetaProvider>
      <Title>Musée MO5</Title>
      <ErrorBoundary
        fallback={(error, reset) => (
          <main class="erreur-boundary">
            <p role="alert">Une erreur inattendue est survenue.</p>
            <button type="button" onClick={reset}>
              Réessayer
            </button>
            <p class="erreur-detail">{error.message}</p>
          </main>
        )}
      >
        <Suspense>{props.children}</Suspense>
      </ErrorBoundary>
    </MetaProvider>
  );
}

export default function App() {
  return (
    <Router root={RootLayout}>
      <FileRoutes />
    </Router>
  );
}

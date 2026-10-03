import { Title } from "@solidjs/meta";

export default function UnauthorizedPage() {
  return (
    <main class="container">
      <Title>Connexion requise — Musée MO5</Title>
      <h1>Connexion requise</h1>
      <p>Votre session est absente ou a expiré.</p>
      <p>
        {/* Lien natif : la route API redirige vers Zitadel, hors navigation SPA. */}
        <a href="/api/auth/signin">Se connecter</a>
      </p>
    </main>
  );
}

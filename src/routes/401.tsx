import { Title } from "@solidjs/meta";

export default function UnauthorizedPage() {
  return (
    <main class="container">
      <Title>Connexion requise — Musée MO5</Title>
      <h1>Connexion requise</h1>
      <p>Votre session est absente ou a expiré.</p>
      <p>
        {/* target=_self : le routeur n'intercepte pas, la route API redirige
            vers Zitadel en navigation pleine page. */}
        <a href="/api/auth/signin" target="_self">Se connecter</a>
      </p>
    </main>
  );
}

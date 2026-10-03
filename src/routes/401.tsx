import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

export default function UnauthorizedPage() {
  return (
    <main class="container">
      <Title>Connexion requise — Musée MO5</Title>
      <h1>Connexion requise</h1>
      <p>Votre session est absente ou a expiré.</p>
      <p>
        <A href="/api/auth/signin">Se connecter</A>
      </p>
    </main>
  );
}

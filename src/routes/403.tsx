import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

export default function ForbiddenPage() {
  return (
    <main class="container">
      <Title>Accès refusé — Musée MO5</Title>
      <h1>Accès refusé</h1>
      <p>Votre rôle ne permet pas d'accéder à cette page.</p>
      <p>
        <A href="/">Retour à l'accueil</A>
      </p>
    </main>
  );
}

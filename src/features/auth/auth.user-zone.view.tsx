import { Show } from "solid-js";
import { museumRoleLabels, museumRolesOf } from "~/features/auth/auth.permissions";
import type { AuthenticatedUser } from "~/features/auth/auth.types";
import styles from "./auth.user-zone.module.css";

export function UserZone(props: { viewer?: AuthenticatedUser | null }) {
  return (
    <Show
      when={props.viewer}
      fallback={
        /* Lien natif : la route API redirige vers Zitadel, hors navigation SPA. */
        <a href="/api/auth/signin" class={styles.connexion}>
          Connexion
        </a>
      }
    >
      {(viewer) => (
        <div class={styles.zone}>
          <span class={styles.name}>{viewer().username}</span>
          <Show when={museumRolesOf(viewer()).length > 0}>
            <span class={styles.role}>
              {museumRolesOf(viewer())
                .map((role) => museumRoleLabels[role])
                .join(", ")}
            </span>
          </Show>
          <form method="post" action="/api/auth/signout">
            <button type="submit" class={styles.signout}>
              Déconnexion
            </button>
          </form>
        </div>
      )}
    </Show>
  );
}

export default UserZone;

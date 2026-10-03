import { Show } from "solid-js";
import { museumRoleLabels, museumRolesOf } from "~/features/auth/auth.permissions";
import type { AuthenticatedUser } from "~/features/auth/auth.types";
import styles from "./auth.user-zone.module.css";

export function UserZone(props: { viewer?: AuthenticatedUser | null }) {
  return (
    <Show
      when={props.viewer}
      fallback={
        /* target=_self : le routeur n'intercepte pas, la route API redirige
           vers Zitadel en navigation pleine page. */
        <a href="/api/auth/signin" target="_self" class={styles.connexion}>
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

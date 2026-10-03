import { A, createAsync } from "@solidjs/router";
import { For, type ParentProps } from "solid-js";
import { museumRolesOf } from "~/features/auth/auth.permissions";
import { getCurrentViewer } from "~/features/auth/auth.query";
import { UserZone } from "~/features/auth/auth.user-zone.view";
import styles from "./app-layout.module.css";
import { navEntries } from "./app-layout.nav";

export function AppLayout(props: ParentProps) {
  const viewer = createAsync(() => getCurrentViewer(), { deferStream: true });

  const visibleEntries = () => {
    const roles = museumRolesOf(viewer());
    return navEntries.filter(
      (entry) => !entry.role || roles.includes(entry.role),
    );
  };

  return (
    <div class={styles.page}>
      <header class={styles.header}>
        <div class={styles.inner}>
          <A href="/" class={styles.brand}>
            Musée MO5
          </A>
          <nav aria-label="Navigation principale" class={styles.nav}>
            <For each={visibleEntries()}>
              {(entry) => (
                <A href={entry.href} end class={styles.link}>
                  {entry.label}
                </A>
              )}
            </For>
          </nav>
          <UserZone viewer={viewer()} />
        </div>
      </header>
      <div class={styles.main}>{props.children}</div>
    </div>
  );
}

export default AppLayout;

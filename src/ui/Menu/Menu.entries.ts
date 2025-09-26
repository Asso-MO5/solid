import type { MenuEntry } from "./Menu.types";

export const menuEntries: MenuEntry[] = [
  {
    label: 'Accueil',
    href: '/',
    roles: { public: true },
    entries: [],
  },
  {
    label: 'Calendrier',
    href: '/admin/cal',
    roles: { member: true },
    entries: [],
  },
]
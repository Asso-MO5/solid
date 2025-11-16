import type { MenuEntry } from "./Menu.types";

export const menuEntries: MenuEntry[] = [
  {
    label: 'Accueil',
    href: '/',
    roles: ['public'],
    entries: [],
  },
  {
    label: 'Musée',
    href: '/museum',
    roles: ['public'],
    entries: [{
      label: 'horaires',
      href: '/museum/schedules',
    }, {
      label: 'tarifs',
      href: '/museum/prices',
    }],
  },
  {
    label: 'Événements',
    href: '/events',
    roles: ['public'],
    entries: [
      {
        label: 'Calendrier',
        href: '/cal',
      },
    ],
  }
]
import type { MenuEntry } from './Menu.types'

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
    entries: [
      {
        label: 'Capacité',
        href: '/museum/capacity',
      },
      {
        label: 'Horaires',
        href: '/museum/schedules',
      },
      {
        label: 'Tarifs',
        href: '/museum/prices',
      },
      {
        label: 'Tickets',
        href: '/museum/tickets',
      },
      {
        label: 'Validation des billets',
        href: '/museum/entries',
      },
      {
        label: 'Codes cadeaux',
        href: '/museum/gift-codes',
      },
    ],
  },
  /*
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
  },
  */
]

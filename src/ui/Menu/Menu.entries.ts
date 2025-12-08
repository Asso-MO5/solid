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
    roles: ['museum', 'dev', "bureau"],
    entries: [
      {
        label: 'Réglages',
        href: '/museum/settings',
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
  {
    label: 'Événements',
    href: '/events',
    roles: ['membres mo5'],
    entries: [
      {
        label: 'Calendrier',
        href: '/cal',
      },
    ],
  },

]

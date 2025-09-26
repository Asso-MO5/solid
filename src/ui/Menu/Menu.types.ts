

type Entry = {
  label: string
  href: string
  roles?: string[]
}

export interface MenuEntry {
  label: string
  href: string
  roles?: string[]
  entries: Entry[]
}
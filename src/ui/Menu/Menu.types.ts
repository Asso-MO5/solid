import type { SessionUser } from "~/features/auth/auth.types"

type Entry = {
  label: string
  href: string
  roles?: Partial<SessionUser["roles"]>
}

export interface MenuEntry {
  label: string
  href: string
  roles?: Partial<SessionUser["roles"]>
  entries: Entry[]
}
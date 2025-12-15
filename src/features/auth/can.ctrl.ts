import { createMemo } from "solid-js"
import { auth } from "./auth.store"
import { authRoles } from "./auth.roles"

/**
 * Propriétés pour vérifier les permissions d'un utilisateur
 */
type UseCanProps = {
  /** Vérifie si l'utilisateur a le rôle bureau (bureau, dev) */
  bureau?: boolean
  /** Vérifie si l'utilisateur a le rôle admin (dev, com, bureau, museum) */
  admin?: boolean
  /** Vérifie si l'utilisateur a le rôle video (video, live) */
  video?: boolean
  /** Vérifie si l'utilisateur a le rôle public (public, @everyone, membres mo5) */
  public?: boolean
  /** Vérifie si l'utilisateur a le rôle member (membres mo5) */
  member?: boolean
}

/**
 * Hook pour vérifier si l'utilisateur a au moins un des rôles demandés
 * 
 * Utilise une logique OR : retourne true si l'utilisateur a au moins un des rôles spécifiés.
 * Les rôles Discord sont testés avec les regex définies dans auth.roles.ts.
 * 
 * @param props - Les rôles à vérifier
 * @returns Un signal mémo qui retourne true si l'utilisateur a au moins un des rôles demandés
 * 
 * @example
 * ```tsx
 * const canAdmin = useCan({ admin: true })
 * if (canAdmin()) {
 *   // L'utilisateur a le rôle admin
 * }
 * 
 * // Vérifier plusieurs rôles (OR logique)
 * const canAdminOrVideo = useCan({ admin: true, video: true })
 * if (canAdminOrVideo()) {
 *   // L'utilisateur a soit admin, soit video
 * }
 * ```
 */
export const useCan = (props: UseCanProps) => {
  const can = createMemo(() => {
    if (!auth?.roles || auth.roles.length === 0) {
      return false
    }

    if (props.bureau && auth.roles.some(role => authRoles.bureau.test(role))) {
      return true
    }

    if (props.admin && auth.roles.some(role => authRoles.admin.test(role))) {
      return true
    }

    if (props.video && auth.roles.some(role => authRoles.video.test(role))) {
      return true
    }
    if (props.public && auth.roles.some(role => authRoles.public.test(role))) {
      return true
    }
    if (props.member && auth.roles.some(role => authRoles.member.test(role))) {
      return true
    }

    return false
  })

  return can
}
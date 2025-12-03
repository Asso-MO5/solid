/**
 * Utilitaires pour synchroniser l'état avec l'URL
 */

/**
 * Met à jour l'URL avec les paramètres donnés
 */
export const updateURL = (params: Record<string, string | number | undefined>) => {
  const urlParams = new URLSearchParams(window.location.search)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.set(key, String(value))
    } else {
      urlParams.delete(key)
    }
  })

  const newUrl = `${window.location.pathname}?${urlParams.toString()}`
  window.history.pushState({}, '', newUrl)
}

/**
 * Lit un paramètre depuis l'URL
 */
export const getURLParam = (key: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(key)
}

/**
 * Lit tous les paramètres depuis l'URL
 */
export const getAllURLParams = (): Record<string, string> => {
  const urlParams = new URLSearchParams(window.location.search)
  const params: Record<string, string> = {}

  urlParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}

/**
 * Supprime un paramètre de l'URL
 */
export const removeURLParam = (key: string) => {
  const urlParams = new URLSearchParams(window.location.search)
  urlParams.delete(key)
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`
  window.history.pushState({}, '', newUrl)
}


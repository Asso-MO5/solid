import { createSignal } from "solid-js"
import type { Price } from "./prices.type"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import { prices, setPrices } from "./price.store"
import { LANGS } from "~/utils/constants"

type TranslationValue = {
  lang: string
  field_name: string
  translation: string
}

export const usePrices = () => {
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [editingPriceId, setEditingPriceId] = createSignal<string | null>(null)
  const [editValues, setEditValues] = createSignal<Partial<Price>>({})
  const [isFetching, setIsFetching] = createSignal<boolean>(false)
  const [translations, setTranslations] = createSignal<Record<string, { name: string; description: string }>>({})

  const getPrices = async () => {
    if (isLoading() || isFetching()) return

    setIsLoading(true)
    setIsFetching(true)
    try {
      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/prices?audience_type=public`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des prix')
      }

      const data = await response.json()
      setPrices(data as Price[])
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les prix.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  const startEdit = (priceId: string) => {
    const price = prices().find(p => p.id === priceId)
    if (price) {
      setEditValues({
        amount: price.amount,
        audience_type: price.audience_type,
        start_date: price.start_date || undefined,
        end_date: price.end_date || undefined,
        is_active: price.is_active,
        requires_proof: price.requires_proof,
      })



      const translations = { ...price.translations } as unknown as Record<string, { name: string; description: string }>
      LANGS.forEach(lang => {
        translations[lang as keyof typeof translations] = {
          name: translations[lang]?.name || '',
          description: translations[lang]?.description || ''
        }
      })
      setTranslations(translations)
      setEditingPriceId(priceId)
    }
  }

  const cancelEdit = () => {
    setEditingPriceId(null)
    setEditValues({})
    setTranslations({})
  }

  const updateTranslation = (lang: string, field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value
      }
    }))
  }

  const updateEditValue = <K extends keyof Price>(field: K, value: Price[K]) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = async (priceId: string) => {
    setIsLoading(true)
    try {
      // Construire le tableau de translations
      const translationsArray: TranslationValue[] = []
      LANGS.forEach(lang => {
        const langData = translations()[lang]
        if (langData) {
          if (langData.name) {
            translationsArray.push({
              lang,
              field_name: 'name',
              translation: langData.name
            })
          }
          if (langData.description) {
            translationsArray.push({
              lang,
              field_name: 'description',
              translation: langData.description
            })
          }
        }
      })

      let startDate = undefined
      let endDate = undefined
      if (editValues().start_date) {
        startDate = editValues().start_date as string
        startDate = new Date(startDate).toISOString().split('T')[0]
      }
      if (editValues().end_date) {
        endDate = editValues().end_date as string
        endDate = new Date(endDate).toISOString().split('T')[0]
      }


      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/prices`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          id: priceId,
          ...editValues(),

          start_date: startDate,
          end_date: endDate,
          translations: translationsArray
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
      }

      const updatedPrice = await response.json()
      setPrices(prev => prev.map(p => p.id === priceId ? updatedPrice : p))
      setEditingPriceId(null)
      setEditValues({})
      setTranslations({})
      toast.success('Succès', 'Prix sauvegardé avec succès.')
    } catch (error) {
      toast.error('Erreur', 'Impossible de sauvegarder le prix.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  const deletePrice = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/prices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      setPrices(prev => prev.filter(p => p.id !== id))
      toast.success('Succès', 'Prix supprimé avec succès.')
    }
    catch (error) {
      toast.error('Erreur', 'Impossible de supprimer le prix.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
    }
  }


  const upsertPrice = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/prices`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "amount": 10,
          "audience_type": "public",
          "is_active": false,
          "requires_proof": false,
          "translations": [
            {
              "lang": "fr",
              "field_name": "name",
              "translation": "Tarif plein"
            },
            {
              "lang": "fr",
              "field_name": "description",
              "translation": "Tarif standard pour le public"
            },
            {
              "lang": "en",
              "field_name": "name",
              "translation": "Full price"
            }
          ]
        }),
      })
      const data = await response.json()

      setPrices(prev => [...prev, data])
      toast.success('Succès', 'Prix créé avec succès.')
    }
    catch (error) {
      toast.error('Erreur', 'Impossible de créer le prix.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  const move = async (priceId: string, direction: 'up' | 'down') => {

    const priceIds = prices().map(p => p.id)
    const index = priceIds.indexOf(priceId)
    if (index === -1) {
      toast.error('Erreur', 'Tarif non trouvé.')
      return
    }

    if (direction === 'up') {
      priceIds[index] = priceIds[index - 1]
      priceIds[index - 1] = priceId
    }

    if (direction === 'down') {
      priceIds[index] = priceIds[index + 1]
      priceIds[index + 1] = priceId
    }

    setPrices(prev => prev.map(p => {
      const newIndex = priceIds.indexOf(p.id)
      return {
        ...p,
        position: newIndex
      }
    }))
    try {

      await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/prices/reorder`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_ids: priceIds,
        }),
      })
    }
    catch (error) {
      toast.error('Erreur', 'Impossible de déplacer le prix.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    isFetching,
    editingPriceId,
    editValues,
    translations,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditValue,
    updateTranslation,
    deletePrice,
    getPrices,
    upsertPrice,
    move
  }
}
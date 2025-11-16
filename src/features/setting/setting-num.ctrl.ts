import { createEffect, createSignal } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"

export const settingNumCtrl = (settingName: string) => {
  const [setting, setSetting] = createSignal<number>(0)
  const [history, setHistory] = createSignal<number>(0)
  const [descriptionHistory, setDescriptionHistory] = createSignal<string>('')
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [description, setDescription] = createSignal<string>('')

  const getSetting = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/settings/${settingName}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      setSetting(data.value)
      setHistory(data.value)
      setDescription(data.description)
      setDescriptionHistory(data.description)
    } catch (error) {
      setSetting(0)
      setDescription('')
      console.error(error)
    }

    finally {
      setIsLoading(false)
    }

  }

  const saveSetting = async (onClose: () => void) => {
    setIsLoading(true)
    try {
      await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/settings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: setting(), key: settingName, description: description() }),
      })
      setHistory(setting())
      setDescriptionHistory(description())
      onClose()
    } catch (error) {
      setSetting(history())
      setDescription(descriptionHistory())
      onClose()
      toast.error('Erreur', 'Impossible de sauvegarder le paramètre.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
    }
  }

  createEffect(() => {
    getSetting()
  })

  return {
    setting,
    setSetting,
    saveSetting,
    isLoading,
    description,
    setDescription,
  }
}
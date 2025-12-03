import { createSignal, Show } from "solid-js"
import type { DistributePackData, GiftCodePack } from "./gift-codes.types"

interface GiftCodesDistributeModalProps {
  pack: GiftCodePack
  onDistribute: (data: DistributePackData) => Promise<void>
  onCancel: () => void
}

export const GiftCodesDistributeModal = (props: GiftCodesDistributeModalProps) => {
  const [recipientEmail, setRecipientEmail] = createSignal<string>('')
  const [subject, setSubject] = createSignal<string>('')
  const [message, setMessage] = createSignal<string>('')
  const [language, setLanguage] = createSignal<string>('fr')
  const [isSubmitting, setIsSubmitting] = createSignal<boolean>(false)

  const unusedCodes = () => props.pack.codes.filter(code => code.status === 'unused')

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!recipientEmail().trim() || unusedCodes().length === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await props.onDistribute({
        code_ids: unusedCodes().map(code => code.id),
        recipient_email: recipientEmail().trim(),
        subject: subject().trim() || 'Vos codes cadeaux',
        message: message().trim() || 'Voici vos codes cadeaux.',
        language: language()
      })
      // La modale sera fermée par distributePack, pas besoin d'appeler onCancel
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 rounded p-3">
        <p class="text-sm text-blue-800">
          <strong>{unusedCodes().length}</strong> code(s) non utilisé(s) seront envoyés
        </p>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">
          Email du destinataire <span class="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={recipientEmail()}
          onInput={(e) => setRecipientEmail(e.currentTarget.value)}
          required
          placeholder="destinataire@example.com"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">
          Langue
        </label>
        <select
          value={language()}
          onChange={(e) => setLanguage(e.currentTarget.value)}
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">
          Sujet de l'email
        </label>
        <input
          type="text"
          value={subject()}
          onInput={(e) => setSubject(e.currentTarget.value)}
          placeholder="Vos codes cadeaux"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          value={message()}
          onInput={(e) => setMessage(e.currentTarget.value)}
          rows={4}
          placeholder="Voici vos codes cadeaux..."
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={() => props.onCancel()}
          disabled={isSubmitting()}
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting() || !recipientEmail().trim() || unusedCodes().length === 0}
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 disabled:opacity-50"
        >
          <Show when={isSubmitting()} fallback="Envoyer">
            Envoi...
          </Show>
        </button>
      </div>
    </form>
  )
}


import { createSignal, Show } from "solid-js"
import type { CreatePackData } from "./gift-codes.types"

interface GiftCodesCreateModalProps {
  onCreate: (data: CreatePackData) => Promise<void>
  onCancel: () => void
}

export const GiftCodesCreateModal = (props: GiftCodesCreateModalProps) => {
  const [quantity, setQuantity] = createSignal<number>(1)
  const [expiresAt, setExpiresAt] = createSignal<string>('')
  const [notes, setNotes] = createSignal<string>('')
  const [isSubmitting, setIsSubmitting] = createSignal<boolean>(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const expires_at = expiresAt() ? expiresAt() + 'T23:59:59Z' : undefined;

    setIsSubmitting(true)
    try {
      await props.onCreate({
        quantity: quantity(),
        expires_at,
        notes: notes().trim() || undefined
      })
      if (props.onCancel) {
        props.onCancel()
      }
    } catch (error) {
      // L'erreur est déjà gérée dans le contrôleur
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculer la date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          rows={3}
          placeholder="Notes optionnelles..."
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">
          Quantité de codes <span class="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={quantity()}
          onInput={(e) => {
            const value = parseInt(e.currentTarget.value, 10)
            if (!isNaN(value) && value >= 1) {
              setQuantity(value)
            }
          }}
          required
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">
          Date d'expiration (optionnel)
        </label>
        <input
          type="date"
          min={today}
          value={expiresAt()}
          onInput={(e: InputEvent) => setExpiresAt((e.currentTarget as HTMLInputElement).value)}
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div class="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={props.onCancel}
          disabled={isSubmitting()}
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting() || !notes().trim()}
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 disabled:opacity-50"
        >
          <Show when={isSubmitting()} fallback="Créer le pack">
            Création...
          </Show>
        </button>
      </div>
    </form>
  )
}


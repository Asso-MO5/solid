import { createSignal } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import type { UpdateTicketData, TicketActionsCtrlReturn } from "./tickets.types"

export const useTicketActions = (): TicketActionsCtrlReturn => {
  const [isUpdating, setIsUpdating] = createSignal(false)
  const [isResending, setIsResending] = createSignal(false)

  const updateTicket = async (ticketId: string, data: UpdateTicketData) => {
    setIsUpdating(true)
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/tickets/${ticketId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du billet')
      }

      toast.success('Succès', 'Billet mis à jour avec succès')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du billet'
      toast.error('Erreur', message)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const resendTickets = async (checkoutId: string) => {
    setIsResending(true)
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/tickets/checkout/${checkoutId}/resend`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors du renvoi des billets')
      }

      toast.success('Succès', 'Billets renvoyés avec succès')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du renvoi des billets'
      toast.error('Erreur', message)
      throw error
    } finally {
      setIsResending(false)
    }
  }

  return {
    updateTicket,
    resendTickets,
    isUpdating,
    isResending,
  }
}


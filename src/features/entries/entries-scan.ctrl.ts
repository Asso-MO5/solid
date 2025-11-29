import { createSignal } from "solid-js"
import { clientEnv } from "~/env/client"
import type { TicketScanResult } from "./entries.types"

export const useEntriesScan = () => {
  const [isScanning, setIsScanning] = createSignal<boolean>(false)
  const [scanResults, setScanResults] = createSignal<TicketScanResult[]>([])
  const [cameraError, setCameraError] = createSignal<string | null>(null)

  const validateTicketByQrCode = async (qrCode: string): Promise<TicketScanResult> => {
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/tickets/validate`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qr_code: qrCode
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let msg = errorData.message || 'Billet non trouvé ou invalide'

        try {
          const jsonMsg = JSON.parse(errorData.error)
          msg = jsonMsg.fr
        } catch (error) {
          // no action needed
        }

        return {
          ticket: null,
          success: false,
          message: msg,
          scannedAt: new Date()
        }
      }

      const ticket = await response.json()
      return {
        ticket,
        success: true,
        message: 'Billet validé avec succès',
        scannedAt: new Date()
      }
    } catch (error) {
      return {
        ticket: null,
        success: false,
        message: 'Erreur lors de la validation',
        scannedAt: new Date()
      }
    }
  }
  const addScanResult = (result: TicketScanResult) => {
    setScanResults(prev => [result, ...prev].slice(0, 3)) // Garder seulement les 3 derniers
  }

  const startScan = () => {
    setIsScanning(true)
    setCameraError(null)
  }

  const stopScan = () => {
    setIsScanning(false)
  }

  return {
    isScanning,
    scanResults,
    cameraError,
    setCameraError,
    validateTicketByQrCode,
    addScanResult,
    startScan,
    stopScan
  }
}


import { createSignal, For, onCleanup, Show } from "solid-js"
import { useEntriesScan } from "./entries-scan.ctrl"
import { toast } from "~/ui/Toast"
import type { Ticket } from "./entries.types"

// Fonction utilitaire pour calculer le montant total d'un ticket
const getTicketTotalAmount = (ticket: Ticket): number => {
  const basePrice = ticket.ticket_price || 0
  const guidedTourPrice = ticket.notes?.guided_tour ? (ticket.notes.guided_tour_price || 0) : 0
  return basePrice + guidedTourPrice
}

// Fonction pour formater le prix
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

interface EntriesScanQrProps {
  onTicketScanned?: (ticket: Ticket) => void
  scanResults: Ticket[]
}

export const EntriesScanQr = (props: EntriesScanQrProps) => {
  const [manualInput, setManualInput] = createSignal('')
  const scanCtrl = useEntriesScan()
  const [videoRef, setVideoRef] = createSignal<HTMLVideoElement | null>(null)
  const [stream, setStream] = createSignal<MediaStream | null>(null)
  const [lastScannedCode, setLastScannedCode] = createSignal<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let QrCode: any = null
  let scanFrameId: number | null = null

  const initQRCodeReader = async () => {
    if (typeof window === 'undefined') return

    try {
      const qrcodeReader = await import('qrcode-reader')
      QrCode = qrcodeReader.default || qrcodeReader
    } catch (error) {
      console.error('Erreur lors du chargement de qrcode-reader:', error)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      setStream(mediaStream)
      const video = videoRef()
      if (video) {
        video.srcObject = mediaStream
        video.play()
        scanQRCode()
      }
    } catch (error) {
      console.error('Erreur caméra:', error)
      scanCtrl.setCameraError('Impossible d\'accéder à la caméra')
      toast.error('Erreur', 'Impossible d\'accéder à la caméra')
    }
  }

  const stopCamera = () => {
    // Arrêter la boucle de scan
    if (scanFrameId !== null) {
      cancelAnimationFrame(scanFrameId)
      scanFrameId = null
    }

    const currentStream = stream()
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    const video = videoRef()
    if (video) {
      video.srcObject = null
    }
    scanCtrl.stopScan()
    // Réinitialiser le dernier code scanné quand on arrête la caméra
    setLastScannedCode(null)
  }

  const scanQRCode = () => {
    if (!QrCode) return

    const video = videoRef()
    if (!video) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const scanFrame = () => {
      // Arrêter le scan seulement si la caméra est arrêtée
      if (!scanCtrl.isScanning()) {
        scanFrameId = null
        return
      }

      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        scanFrameId = requestAnimationFrame(scanFrame)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context?.getImageData(0, 0, canvas.width, canvas.height)
      if (!imageData) {
        scanFrameId = requestAnimationFrame(scanFrame)
        return
      }

      if (!QrCode) {
        scanFrameId = requestAnimationFrame(scanFrame)
        return
      }
      const qr = new QrCode()
      // Capturer la valeur réactive avant le callback
      const currentLastScannedCode = lastScannedCode()
      qr.callback = (err: Error | null, value: { result: string } | null) => {
        if (err) {
          scanFrameId = requestAnimationFrame(scanFrame)
          return
        }

        if (value) {
          // Ignorer si c'est le même code que le dernier scanné
          if (value.result !== currentLastScannedCode) {
            handleQRCodeScanned(value.result)
          }
          // Continuer le scan dans tous les cas
          scanFrameId = requestAnimationFrame(scanFrame)
        } else {
          scanFrameId = requestAnimationFrame(scanFrame)
        }
      }
      qr.decode(imageData)
    }

    scanFrameId = requestAnimationFrame(scanFrame)
  }

  const handleQRCodeScanned = async (qrCode: string) => {
    // Enregistrer le code scanné pour éviter les scans multiples
    setLastScannedCode(qrCode)

    const result = await scanCtrl.validateTicketByQrCode(qrCode)
    scanCtrl.addScanResult(result)

    if (result.success && result.ticket) {
      const totalAmount = getTicketTotalAmount(result.ticket)
      const transactionStatus = result.ticket.transaction_status === 'not_paid' ? ' (Non payé)' : ' (Payé)'
      toast.success('Succès', `${result.message} - Montant: ${formatPrice(totalAmount)}${transactionStatus}`)
      props.onTicketScanned?.(result.ticket)
    } else {
      toast.error('Erreur', result.message)
    }
  }

  const handleManualSubmit = async () => {
    const input = manualInput().trim()
    if (!input) return
    const result = await scanCtrl.validateTicketByQrCode(input)
    scanCtrl.addScanResult(result)

    if (result.success && result.ticket) {
      const totalAmount = getTicketTotalAmount(result.ticket)
      const transactionStatus = result.ticket.transaction_status === 'not_paid' ? ' (Non payé)' : ' (Payé)'
      toast.success('Succès', `${result.message} - Montant: ${formatPrice(totalAmount)}${transactionStatus}`)
      props.onTicketScanned?.(result.ticket)
    } else {
      console.error(result)
      toast.error('Erreur', result.message)
    }

    setManualInput('')
  }


  onCleanup(() => {
    stopCamera()
  })


  return (
    <div class="flex flex-col gap-4 p-3">
      {/* Zone de scan vidéo */}
      <div class="relative">
        <Show when={!scanCtrl.isScanning()}>
          <div
            class="aspect-video rounded-lg border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => void (async () => {
              await initQRCodeReader()
              scanCtrl.startScan()
              await startCamera()
            })()}
          >
            <div class="text-gray-500">
              CAMERA OFF
            </div>
          </div>
        </Show>

        <Show when={scanCtrl.isScanning()}>
          <div
            class="relative cursor-pointer"
            onClick={stopCamera}
          >
            <video
              ref={setVideoRef}
              autoplay
              playsinline
              class="aspect-video ratio-16/9 rounded-lg border border-gray-300"
            //  style={{ transform: 'scaleX(-1)' }}
            />
            <Show when={scanCtrl.cameraError()}>
              <div class="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600">{scanCtrl.cameraError()}</p>
              </div>
            </Show>
            {/* Chip "Arrêter" en haut à droite */}
            <div class="absolute top-2 right-2 pointer-events-none">
              <span class="px-3 py-1 bg-red-500 text-white text-xs rounded-full shadow-md">
                Arrêter
              </span>
            </div>
          </div>
        </Show>

        {/* Chip "Scanner" en haut à droite quand la caméra est éteinte */}
        <Show when={!scanCtrl.isScanning()}>
          <div class="absolute top-2 right-2">
            <span class="px-3 py-1 bg-primary text-white text-xs rounded-full shadow-md">
              Scanner
            </span>
          </div>
        </Show>
      </div>

      {/* Champ de saisie manuelle */}
      <div class="flex flex-col gap-2">
        <div class="flex gap-2 flex-col">
          <input
            type="text"
            value={manualInput()}
            onInput={(e) => setManualInput(e.currentTarget.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            placeholder="QR code ou ID du billet"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleManualSubmit}
            disabled={!manualInput().trim()}
            class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 disabled:opacity-50"
          >
            Valider
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <For each={props?.scanResults || []}>
            {(ticket) => {
              const totalAmount = getTicketTotalAmount(ticket)
              return (
                <div>
                  <div class="flex items-center justify-between p-2 border border-gray-300 rounded-lg">
                    <div class="flex-1">
                      <div class="font-semibold">
                        {new Date(ticket?.used_at || '').toLocaleTimeString('fr-FR')}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">
                        {ticket?.first_name} {ticket?.last_name || ''}
                      </div>

                      <div class="text-sm text-gray-600 mt-1">
                        {ticket?.qr_code || ''}
                      </div>
                      <div class="text-sm font-semibold text-green-600 mt-1">
                        Montant: {formatPrice(totalAmount)}
                      </div>
                      <div class={`text-sm font-medium mt-1 ${ticket?.transaction_status === 'not_paid' ? 'text-red-600' : 'text-green-600'}`}>
                        {ticket?.transaction_status === 'not_paid' ? 'Non payé' : 'Payé'}
                      </div>
                      <Show when={ticket?.notes?.guided_tour}>
                        <div class="text-sm text-blue-600 mt-1">
                          Visite guidée
                        </div>
                      </Show>
                      <Show when={ticket?.notes?.pricing_info?.requires_proof}>
                        <div class="text-sm text-accent mt-1">
                          {ticket?.notes?.pricing_info?.translations?.fr?.description}
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </div >
    </div >
  )
}


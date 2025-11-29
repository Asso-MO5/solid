import { createSignal, For, onCleanup, Show } from "solid-js"
import { useEntriesScan } from "./entries-scan.ctrl"
import { toast } from "~/ui/Toast"
import type { Ticket } from "./entries.types"

interface EntriesScanQrProps {
  onTicketScanned?: (ticket: Ticket) => void
  scanResults: Ticket[]
}

export const EntriesScanQr = (props: EntriesScanQrProps) => {
  const [manualInput, setManualInput] = createSignal('')
  const scanCtrl = useEntriesScan()
  const [videoRef, setVideoRef] = createSignal<HTMLVideoElement | null>(null)
  const [stream, setStream] = createSignal<MediaStream | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let QrCode: any = null

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
  }

  const scanQRCode = () => {
    if (!QrCode) return

    const video = videoRef()
    if (!video) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const scanFrame = () => {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanFrame)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context?.getImageData(0, 0, canvas.width, canvas.height)
      if (!imageData) {
        requestAnimationFrame(scanFrame)
        return
      }

      if (!QrCode) {
        requestAnimationFrame(scanFrame)
        return
      }
      const qr = new QrCode()
      qr.callback = (err: Error | null, value: { result: string } | null) => {
        if (err) {
          requestAnimationFrame(scanFrame)
          return
        }

        if (value) {
          handleQRCodeScanned(value.result)
        } else {
          requestAnimationFrame(scanFrame)
        }
      }
      qr.decode(imageData)
    }

    scanFrame()
  }

  const handleQRCodeScanned = async (qrCode: string) => {
    stopCamera()

    const result = await scanCtrl.validateTicketByQrCode(qrCode)
    scanCtrl.addScanResult(result)

    if (result.success && result.ticket) {
      toast.success('Succès', result.message)
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
      toast.success('Succès', result.message)
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
      <Show when={!scanCtrl.isScanning()}>
        <div class=" aspect-video rounded-lg border border-gray-300 flex items-center justify-center" >
          <div>
            CAMERA OFF
          </div>
        </div>
      </Show>

      <Show when={scanCtrl.isScanning()}>
        <div class="relative">
          <video
            ref={setVideoRef}
            autoplay
            playsinline
            class="aspect-video ratio-16/9 rounded-lg border border-gray-300"
            style={{ transform: 'scaleX(-1)' }} // Miroir pour meilleure UX
          />
          <Show when={scanCtrl.cameraError()}>
            <div class="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-600">{scanCtrl.cameraError()}</p>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={!scanCtrl.isScanning()}>
        <div class="flex flex-col gap-2">
          <button onClick={() => void (async () => {
            await initQRCodeReader()
            scanCtrl.startScan()
            await startCamera()
          })()} class="primary">
            Scanner
          </button>
        </div>
      </Show>
      <Show when={scanCtrl.isScanning()}>
        <button onClick={stopCamera} class="secondary">
          Arrêter le scan
        </button>
      </Show>

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
            {(result) => <div>
              <div class="flex items-center justify-between p-2 border border-gray-300 rounded-lg">
                <div class="flex-1">
                  <div class="font-semibold">
                    {new Date(result?.used_at || '').toLocaleTimeString('fr-FR')}
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    {result?.first_name} {result?.last_name || ''}
                  </div>

                  <div class="text-sm text-gray-600 mt-1">
                    {result?.qr_code || ''}
                  </div>
                  <Show when={result?.notes?.pricing_info?.requires_proof}>
                    <div class="text-sm text-accent mt-1">
                      {result?.notes?.pricing_info?.translations?.fr?.description}
                    </div>
                  </Show>
                </div>
              </div>
            </div>}
          </For>
        </div>
      </div >
    </div >
  )
}


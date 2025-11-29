declare module 'qrcode-reader' {
  interface QRCodeResult {
    result: string
  }

  class QrCode {
    callback: (err: Error | null, value: QRCodeResult | null) => void
    decode(imageData: ImageData): void
  }

  export default QrCode
}


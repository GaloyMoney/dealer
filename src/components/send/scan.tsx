import { useEffect, useRef, useState } from "react"

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBarcodeDetected: (barcodeValue: string) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValidBarcode: (data: any) => Promise<void>
}

const Scan = ({ onBarcodeDetected, onValidBarcode }: Props) => {
  const [detecting, setDetecting] = useState<boolean>(false)
  const [showCloseButton, setShowCloseButton] = useState<boolean>(false)
  const videoElementRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const supported = "mediaDevices" in navigator
    if (supported && detecting) {
      const detectBarcode = async () => {
        const QRCodeDetecor =
          "BarcodeDetector" in window
            ? window.BarcodeDetector
            : await import("barcode-detector")
        const barcodeDetector = new QRCodeDetecor({ formats: ["qr_code"] })

        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        const video = videoElementRef.current

        if (!video || !barcodeDetector) {
          return
        }

        video.srcObject = stream
        video.onplaying = () => {
          setShowCloseButton(true)
        }

        const renderLoop = async () => {
          try {
            if (!detecting) {
              return
            }
            requestAnimationFrame(renderLoop)
            const barcodes: BarCode[] = await barcodeDetector.detect(video)
            for (const barcode of barcodes) {
              const parsedResult = onBarcodeDetected(barcode.rawValue)
              if (parsedResult) {
                onValidBarcode(parsedResult)
                stream.getTracks().forEach((track) => track.stop())
                setDetecting(false)
                break
              }
            }
          } catch (err) {
            // Do nothing
          }
        }

        renderLoop()
      }
      detectBarcode()
    }
  }, [detecting, onBarcodeDetected, onValidBarcode])

  const scanQRCode = () => {
    setDetecting(true)
  }

  const handleClose = () => {
    if (videoElementRef.current) {
      ;(videoElementRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop())
    }
    setDetecting(false)
  }

  return (
    <div>
      <div className="scan link center-display" onClick={scanQRCode}>
        Scan a QR code
      </div>
      {detecting && (
        <div className="qr-code-camera">
          <video ref={videoElementRef} autoPlay />
          {showCloseButton && (
            <div className="close link" onClick={handleClose}>
              Close
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Scan

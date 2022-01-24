import Spinner from "components/spinner"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { useEffect, useRef, useState } from "react"
import { translate } from "translate"

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBarcodeDetected: (barcodeValue: string) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValidBarcode: (data: any) => Promise<void>
}

const Scan = ({ onBarcodeDetected, onValidBarcode }: Props) => {
  const [detecting, setDetecting] = useState<boolean>(false)
  const [cameraReady, setCameraReady] = useState<boolean>(false)
  const qrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    if (detecting) {
      qrCodeRef.current =
        qrCodeRef.current ||
        new Html5Qrcode("qr-code-camera", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })

      const detectBarcode = async () => {
        const onScanSuccess = async (decodedText: string) => {
          const parsedResult = onBarcodeDetected(decodedText)

          if (parsedResult) {
            onValidBarcode(parsedResult)
            await qrCodeRef.current?.stop()
            setDetecting(false)
          }
        }

        await qrCodeRef.current?.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 400 },
          onScanSuccess,
          () => {
            // Do nothing for invalid scans
          },
        )
        setCameraReady(true)
      }
      detectBarcode()
    }
  }, [detecting, onBarcodeDetected, onValidBarcode])

  const scanQRCode = () => {
    setDetecting(true)
  }

  const handleClose = async () => {
    await qrCodeRef.current?.stop()
    setDetecting(false)
  }

  return (
    <div>
      {detecting ? (
        <div className="qr-code-camera">
          <div id="qr-code-camera"></div>
          {cameraReady ? (
            <div className="close link" onClick={handleClose}>
              {translate("Close")}
            </div>
          ) : (
            <Spinner size="big" />
          )}
        </div>
      ) : (
        <div className="scan link center-display" onClick={scanQRCode}>
          {translate("Scan QR code")}
        </div>
      )}
    </div>
  )
}

export default Scan

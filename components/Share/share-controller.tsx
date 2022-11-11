import React, { type FC } from "react"

interface Props {
  children: React.ReactNode
  shareData: ShareData
  files: [string]
  getImage?: () => void
  onSuccess?: () => void
  onError?: (error?: unknown) => void
  onNonNativeShare?: () => void
  onInteraction?: () => void
  disabled?: boolean
}

const ShareController: FC<Props> = ({
  children,
  shareData,
  files,
  getImage,
  onInteraction,
  onSuccess,
  onError,
  onNonNativeShare,
  disabled,
}) => {
  const handleOnClick = async () => {
    getImage && getImage()

    const file = [
      new File(files, "BBW lightning invoice QR code", {
        type: "image/png",
        lastModified: Date.now(),
      }),
    ]

    onInteraction && onInteraction()
    if (!navigator.canShare) {
      return onNonNativeShare && onNonNativeShare()
    }
    if (navigator.canShare({ files: file })) {
      try {
        await navigator.share({ files: file, ...shareData })
        onSuccess && onSuccess()
      } catch (err) {
        onError && onError(err)
      }
    }
  }

  return (
    <button onClick={handleOnClick} type="button" disabled={disabled}>
      {children}
    </button>
  )
}

export default ShareController

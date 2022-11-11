import React, { type FC, useState } from "react"

import styles from "./share.module.css"

type ShareState = "pending" | "success" | "error"

interface Props {
  shareData: ShareData
  files?: [string]
  getImage?: () => void
  shareState: string | undefined
  onClose: () => void
  onError?: (error?: unknown) => void
}

const SharePopup: FC<Props> = ({
  shareData,
  shareState,
  files,
  getImage,
  onClose,
  onError,
}) => {
  const [state, setState] = useState<ShareState>("pending")

  const copyImageToClipboard = async () => {
    try {
      if (files) {
        getImage && getImage()

        const data = await fetch(files[0])
        const blob = await data.blob()

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])

        setState("success")
        setTimeout(() => {
          setState("pending")
          onClose()
        }, 2000)
      }
    } catch (err) {
      onError && onError(err)
      setState("error")
    }
  }

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData?.url || "")
      setState("success")
      setTimeout(() => {
        setState("pending")
        onClose()
      }, 1000)
    } catch (err) {
      onError && onError(err)
      setState("error")
    }
  }

  return (
    <div>
      <div>
        {state === "error" && (
          <div>
            <p>Unable to copy to clipboard, please manually copy the url to share.</p>
          </div>
        )}

        {shareState === "not-set" ? (
          <div className={styles.container}>
            {state === "success" ? (
              <div className={styles.select_share_type}>Copied to clipboard</div>
            ) : (
              <div className={styles.select_share_type}>
                <button onClick={onClose} className={styles.close_btn}>
                  <div aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <g id="close">
                        <path
                          id="x"
                          d="M18.717 6.697l-1.414-1.414-5.303 5.303-5.303-5.303-1.414 1.414 5.303 5.303-5.303 5.303 1.414 1.414 5.303-5.303 5.303 5.303 1.414-1.414-5.303-5.303z"
                        />
                      </g>
                    </svg>
                  </div>
                </button>
                <button onClick={copyUrlToClipboard}>Link</button>
                <button onClick={copyImageToClipboard}>QR code</button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SharePopup

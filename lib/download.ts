export const getOS = () => {
  // @ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return undefined
  }

  if (/android/i.test(userAgent)) {
    return "android"
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  // @ts-ignore
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "ios"
  }

  return undefined
}

export const playStoreLink = "https://play.google.com/store/apps/details?id=com.galoyapp"
export const appStoreLink = "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"
export const apkLink = "https://storage.googleapis.com/bitcoin-beach-wallet/latest.apk"

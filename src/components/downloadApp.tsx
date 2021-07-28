import React from "react"
import { QRCode } from "react-qrcode-logo"
import Image from "react-bootstrap/Image"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Header from "./header"

export const getOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return undefined
  }

  if (/android/i.test(userAgent)) {
    return "android"
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "ios"
  }

  return undefined
}

export const playStoreLink = "https://play.google.com/store/apps/details?id=com.galoyapp"
export const appStoreLink = "https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905"
export const apkLink = "https://storage.googleapis.com/bitcoin-beach-wallet/latest.apk"

const DownloadApp = () => {
  const os = getOS()

  if (os === "android") {
    window.location.replace("https://play.google.com/store/apps/details?id=com.galoyapp")
  } else if (os === "ios") {
    window.location.replace(
      "itms-apps://itunes.apple.com/app/bitcoin-beach-wallet/id1531383905",
    )
  }

  return (
    <div>
      <Header />
      <Container>
        <br />
        <h3>Download the Bitcoin Beach Wallet</h3>
        <br />
        <Row>
          <Col>
            <a href={appStoreLink}>
              <Image src={process.env.PUBLIC_URL + "/apple-app-store.png"} rounded />
            </a>
            <br />
            <br />
          </Col>
          <Col>
            <a href={playStoreLink}>
              <Image src={process.env.PUBLIC_URL + "/google-play-badge.png"} rounded />
            </a>
          </Col>
          <Col>
            <div style={{ width: 200 }}>
              <Button href={apkLink} block variant="outline-dark">
                Download APK
                <br /> for Android
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <QRCode value={appStoreLink} size={200} />
          </Col>
          <Col>
            <QRCode value={playStoreLink} size={200} />
          </Col>
          <Col>
            <QRCode value={apkLink} size={200} />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default DownloadApp

import { QRCode } from "react-qrcode-logo"
import Image from "react-bootstrap/Image"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"

import { getOS, playStoreLink, appStoreLink, apkLink } from "../lib/download"

function DownloadApp() {
  const os = getOS()

  if (os === "android") {
    window.location.replace("https://play.google.com/store/apps/details?id=com.galoyapp")
  } else if (os === "ios") {
    window.location.replace(
      "itms-apps://itunes.apple.com/app/bitcoin-beach-wallet/id1531383905",
    )
  }

  return (
    <Container>
      <br />
      <h3>Download the Bitcoin Beach Wallet</h3>
      <br />
      <Row>
        <Col>
          <a href={appStoreLink}>
            <Image src="/apple-app-store.png" rounded />
          </a>
          <br />
          <br />
        </Col>
        <Col>
          <a href={playStoreLink}>
            <Image src="/google-play-badge.png" rounded />
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
  )
}

export default DownloadApp

import React from 'react';
import QRCode from 'qrcode.react';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Header from './header.js'

const DownloadApp = () => {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return
  }

  if (/android/i.test(userAgent)) {
    return window.location.replace("https://play.google.com/store/apps/details?id=com.galoyapp")
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return window.location.replace("itms-apps://itunes.apple.com/app/bitcoin-beach-wallet/id1531383905")
  }

  return (
    <div>
    <Header />
      <Container>
      <br />
      <br />
        <Row>
          <Col>
            <a href="https://play.google.com/store/apps/details?id=com.galoyapp">
            <Image src={process.env.PUBLIC_URL + '/google-play-badge.png'} rounded/>
            </a>
          </Col>
          <Col>
            <a href="https://apps.apple.com/app/bitcoin-beach-wallet/id1531383905">
            <Image src={process.env.PUBLIC_URL + '/apple-app-store.png'} rounded/>
            </a>
          </Col>
      </Row>
      </Container>
    </div>
  )
}

export default DownloadApp
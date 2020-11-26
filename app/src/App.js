import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/home.js'
import Header from './components/header.js'
import Receive from './components/receive.js'
import { useRoutes } from 'hookrouter';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const Redirect = () => {
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

const routes = {
  '/': () => <Home />,
  '/elzonte': () => Redirect(),
  '/:username': ({ username }) => <Receive username={username} />
};

function App() {

  let routeResult = useRoutes(routes);

  return routeResult || <Home />;
}

export default App;

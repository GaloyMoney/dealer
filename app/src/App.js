import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/home.js'
import Receive from './components/receive.js'
import { useRoutes } from 'hookrouter';

const Redirect = () => {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return
  }

  if (/android/i.test(userAgent)) {
    window.location.replace("https://play.google.com/store/apps/details?id=com.galoyapp")
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    window.location.replace("itms-apps://itunes.apple.com/app/bitcoin-beach-wallet/id1531383905")
  }
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

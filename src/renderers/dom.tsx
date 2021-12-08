import * as ReactDOM from 'react-dom';

import Root from 'components/root';

import '../styles/index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('HTML root element is missing');
}

ReactDOM.hydrateRoot(container, <Root />);

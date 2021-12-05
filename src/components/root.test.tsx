import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';

import Root from './root';

describe('Root', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = render(<Root />);
    expect(asFragment()).toMatchSnapshot();
  });
});

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

/** Mount the real app at a given URL path (App owns its BrowserRouter). */
export function renderApp(path = '/') {
  window.history.pushState({}, '', path);
  const user = userEvent.setup();
  return { user, ...render(<App />) };
}

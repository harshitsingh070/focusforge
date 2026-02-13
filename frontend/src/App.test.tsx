import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('redirects unauthenticated user to login page', () => {
  localStorage.removeItem('token');
  render(<App />);
  expect(screen.getByText(/sign in to focusforge/i)).toBeInTheDocument();
});

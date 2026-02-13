import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('shows landing page for unauthenticated user', () => {
  localStorage.removeItem('token');
  render(<App />);
  expect(screen.getByText(/forge consistency with purpose-driven goals/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /create free account/i })).toBeInTheDocument();
});

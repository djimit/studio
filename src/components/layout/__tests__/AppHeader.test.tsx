import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppHeader } from '../AppHeader';

describe('AppHeader', () => {
  it('renders the header text', () => {
    render(<AppHeader />);
    expect(screen.getByText('PromptRefiner')).toBeInTheDocument();
  });
});
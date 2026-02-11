import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import Proposals from '../pages/Proposals';

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    render(<Dashboard />);
    const heading = screen.getByText(/Treasury Dashboard/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<Dashboard />);
    const loadingText = screen.getByText(/Loading.../i);
    expect(loadingText).toBeInTheDocument();
  });
});


describe('Proposals', () => {
  it('renders proposals heading', () => {
    render(<Proposals />);
    const heading = screen.getByText(/Proposals/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<Proposals />);
    const loadingText = screen.getByText(/Loading.../i);
    expect(loadingText).toBeInTheDocument();
  });
});

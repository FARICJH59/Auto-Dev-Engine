/**
 * Frontend Smoke Tests
 * Phase-2 - Basic component tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App, { Home, Dashboard, Orchestrator, Services, Tools, NotFound } from '../src/App';

// Helper to wrap components that use routing
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Frontend Smoke Tests', () => {
  describe('App Component', () => {
    it('should render the main app shell', () => {
      render(<App />);
      
      expect(screen.getByText('ADE')).toBeInTheDocument();
      expect(screen.getByText('Phase-2')).toBeInTheDocument();
    });

    it('should display the footer', () => {
      render(<App />);
      
      expect(screen.getByText(/Auto-Dev-Engine/)).toBeInTheDocument();
    });
  });

  describe('Home Component', () => {
    it('should render home page content', () => {
      renderWithRouter(<Home />);
      
      expect(screen.getByText('Auto-Dev-Engine')).toBeInTheDocument();
      expect(screen.getByText(/Welcome to the Auto-Dev-Engine/)).toBeInTheDocument();
    });

    it('should display navigation links', () => {
      renderWithRouter(<Home />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orchestrator')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Tools')).toBeInTheDocument();
    });
  });

  describe('Dashboard Component', () => {
    it('should render dashboard placeholder', () => {
      renderWithRouter(<Dashboard />);
      
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });
  });

  describe('Orchestrator Component', () => {
    it('should render orchestrator placeholder', () => {
      renderWithRouter(<Orchestrator />);
      
      expect(screen.getByRole('heading', { name: 'Orchestrator' })).toBeInTheDocument();
    });
  });

  describe('Services Component', () => {
    it('should render services placeholder', () => {
      renderWithRouter(<Services />);
      
      expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument();
    });
  });

  describe('Tools Component', () => {
    it('should render tools placeholder', () => {
      renderWithRouter(<Tools />);
      
      expect(screen.getByRole('heading', { name: 'Tool Bus' })).toBeInTheDocument();
    });
  });

  describe('NotFound Component', () => {
    it('should render 404 page', () => {
      renderWithRouter(<NotFound />);
      
      expect(screen.getByText(/404/)).toBeInTheDocument();
      expect(screen.getByText('Return to Home')).toBeInTheDocument();
    });
  });
});

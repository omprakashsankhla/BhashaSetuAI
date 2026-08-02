import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from '../src/pages/AuthPage';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' }
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div data-testid="google-login-btn">Google Login</div>,
  useGoogleLogin: () => vi.fn()
}));

describe('AuthPage Component', () => {
  it('renders register form by default', () => {
    render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>
    );
    expect(screen.getAllByText('tab_register').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('placeholder_fullname')).toBeInTheDocument();
  });

  it('switches to login form when clicking login link', () => {
    render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>
    );
    
    const loginButton = screen.getByText('link_login');
    fireEvent.click(loginButton);
    
    expect(screen.getAllByText('tab_login').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('placeholder_email')).toBeInTheDocument();
  });
});

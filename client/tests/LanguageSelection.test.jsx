import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LanguageSelection from '../src/pages/LanguageSelection';

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

describe('LanguageSelection Component', () => {
  it('renders language options correctly', () => {
    render(
      <BrowserRouter>
        <LanguageSelection />
      </BrowserRouter>
    );
    expect(screen.getByText('choose_lang')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
  });
  
  it('navigates to register when continue is clicked', () => {
    render(
      <BrowserRouter>
        <LanguageSelection />
      </BrowserRouter>
    );
    
    // Select English
    fireEvent.click(screen.getByText('English'));
    
    // Click Continue
    fireEvent.click(screen.getByText((content, element) => element.className === 'ls-continue-btn'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});

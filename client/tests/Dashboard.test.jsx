import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../src/pages/Dashboard';

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

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    
    global.fetch = vi.fn((url) => {
      if (url.includes('ai-insight')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ summary: "Good job" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: { name: 'Test User', preferred_language: 'en' },
          stats: { xp: 100, streak: 5, coins: 50 },
          lessons: [],
          todaysGoal: { earned: 10, target: 20 },
          dayNumber: 1,
          unitProgress: 50,
          achievements: [],
          rank: 'Silver',
          leaderboard: [],
          skillAnalysis: { listening: 80, speaking: 70, reading: 90, writing: 60 },
          todaysTasks: [],
          assignedTasks: []
        }),
      });
    });
  });

  it('renders dashboard with user data', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(await screen.findByText(/dash_hello/)).toBeInTheDocument();
  });
});

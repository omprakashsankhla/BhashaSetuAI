import { lazy } from 'react';

// Wrap the Sandbox games so they can be loaded by type
const SandboxWrapper = lazy(() => import('../components/games/SandboxGames'));

export const GameRegistry = {
  'balloon-pop': lazy(() => import('../components/games/BalloonPop')),
  'trace-letters': lazy(() => import('../components/games/TraceMaster')),
  'sound-match': lazy(() => import('../components/games/SoundMatcher')),
  'fruit-catch': lazy(() => import('../components/games/FruitCatcher')),
  'sentence-builder': lazy(() => import('../components/games/SentenceBuilder')),
  'sign-reader': lazy(() => import('../components/games/SignReader')),
  'shop-keeper': lazy(() => import('../components/games/ShopKeeper')),
  'word-sprint': lazy(() => import('../components/games/WordSprint')),
  'echo-chamber': lazy(() => import('../components/games/EchoChamber')),
  'text-detective': lazy(() => import('../components/games/TextDetective')),
  // Sandbox Games
  'pic-bingo': SandboxWrapper,
  'memory-flip': SandboxWrapper,
  'crossword-clue': SandboxWrapper,
  'tense-shift': SandboxWrapper,
  'dialogue-puzzler': SandboxWrapper,
  'speed-editor': SandboxWrapper,
  'debate-builder': SandboxWrapper,
  'idiom-connect': SandboxWrapper,
};

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface Card {
  id: string;      // Unique identifier (e.g., 'spades-13-1')
  suit: Suit;
  rank: number;    // 1 (A) to 13 (K)
  isFaceUp: boolean;
}

export type Difficulty = 1 | 2 | 4;

export interface GameState {
  difficulty: Difficulty;
  tableau: Card[][];       // 10 columns
  stock: Card[];           // Flat list of remaining stock cards (initially 50 cards)
  completedRuns: Suit[];   // List of completed suit runs (up to 8 runs)
  score: number;
  movesCount: number;
  startTime: number | null; // Timestamp when first move or game starts
  elapsedTime: number;      // Seconds elapsed
  isGameActive: boolean;
  victory: boolean;
  selectedCard: { colIndex: number; cardIndex: number } | null;
}

export interface GameHistoryState {
  tableau: Card[][];
  stock: Card[];
  completedRuns: Suit[];
  score: number;
  movesCount: number;
}

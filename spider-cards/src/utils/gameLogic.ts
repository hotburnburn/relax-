import type { Card, Suit, Difficulty } from '../types/game';

// Helper to generate a unique card ID
const generateCardId = (suit: Suit, rank: number, index: number): string => {
  return `${suit}-${rank}-${index}`;
};

// Create a double deck (104 cards) based on difficulty
export const createDeck = (difficulty: Difficulty): Card[] => {
  const deck: Card[] = [];
  let suits: Suit[] = [];

  if (difficulty === 1) {
    // 1 Suit: All Spades (104 Spades)
    suits = ['spades', 'spades', 'spades', 'spades', 'spades', 'spades', 'spades', 'spades'];
  } else if (difficulty === 2) {
    // 2 Suits: Spades and Hearts (52 Spades, 52 Hearts)
    suits = [
      'spades', 'spades', 'spades', 'spades',
      'hearts', 'hearts', 'hearts', 'hearts'
    ];
  } else {
    // 4 Suits: Spades, Hearts, Diamonds, Clubs (26 of each)
    suits = [
      'spades', 'spades',
      'hearts', 'hearts',
      'diamonds', 'diamonds',
      'clubs', 'clubs'
    ];
  }

  // Each suit in the list gets 13 ranks (A to K)
  suits.forEach((suit, suitIndex) => {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: generateCardId(suit, rank, suitIndex * 13 + rank),
        suit,
        rank,
        isFaceUp: false,
      });
    }
  });

  return deck;
};

// Shuffle function (Fisher-Yates)
export const shuffle = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Initialize tableau and stock
export const initializeGame = (difficulty: Difficulty): { tableau: Card[][]; stock: Card[] } => {
  const deck = shuffle(createDeck(difficulty));
  const tableau: Card[][] = Array.from({ length: 10 }, () => []);

  // Deal cards to tableau
  // First 4 columns: 6 cards each (5 face down, top one face up)
  // Last 6 columns: 5 cards each (4 face down, top one face up)
  let deckIndex = 0;

  for (let col = 0; col < 10; col++) {
    const cardCount = col < 4 ? 6 : 5;
    for (let row = 0; row < cardCount; row++) {
      const card = deck[deckIndex++];
      if (row === cardCount - 1) {
        card.isFaceUp = true;
      }
      tableau[col].push(card);
    }
  }

  // The remaining 50 cards go to the stock
  const stock = deck.slice(deckIndex);

  return { tableau, stock };
};

// Check if a single card can be placed on targetCard
// (targetCard is the bottom card of the target column)
export const canPlaceOn = (movingCard: Card, targetCard: Card | undefined): boolean => {
  if (!targetCard) {
    return true; // Any card can be placed on an empty column
  }
  // Rank must be exactly one less (e.g., 4 on 5)
  return targetCard.rank === movingCard.rank + 1;
};

// Check if a card stack (from cardIndex to end of column) is a valid moving sequence.
// In Spider Solitaire, a moving sequence must be descending in rank and of the SAME suit.
export const canSelectCard = (column: Card[], cardIndex: number): boolean => {
  if (cardIndex < 0 || cardIndex >= column.length) return false;
  
  const card = column[cardIndex];
  if (!card.isFaceUp) return false;

  // Check if all cards from cardIndex to the end are in descending order and same suit
  for (let i = cardIndex; i < column.length - 1; i++) {
    const current = column[i];
    const next = column[i + 1];
    
    if (!next.isFaceUp) return false;
    if (next.suit !== current.suit) return false;
    if (current.rank !== next.rank + 1) return false;
  }

  return true;
};

// Check if a moving stack can be placed on the target column
export const isValidMove = (movingStack: Card[], targetColumn: Card[]): boolean => {
  if (movingStack.length === 0) return false;
  const topMovingCard = movingStack[0];
  const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : undefined;
  
  return canPlaceOn(topMovingCard, targetCard);
};

// Check if there are completed runs (K down to A of the same suit)
export const checkCompletedRuns = (
  tableau: Card[][]
): { newTableau: Card[][]; completedRun: Suit | null } => {
  const newTableau = tableau.map(col => [...col]);
  
  for (let colIndex = 0; colIndex < 10; colIndex++) {
    const col = newTableau[colIndex];
    if (col.length < 13) continue;

    // Scan from the bottom of the column upwards
    for (let startIdx = col.length - 13; startIdx >= 0; startIdx--) {
      // Check if this card starts a run (must be rank 13 - King)
      if (col[startIdx].rank !== 13 || !col[startIdx].isFaceUp) continue;

      let isValidRun = true;
      const suit = col[startIdx].suit;

      for (let i = 0; i < 13; i++) {
        const card = col[startIdx + i];
        if (!card.isFaceUp || card.suit !== suit || card.rank !== 13 - i) {
          isValidRun = false;
          break;
        }
      }

      if (isValidRun) {
        // Remove the 13 cards forming the run
        col.splice(startIdx, 13);
        
        // Flip the new bottom card face up if it's face down
        if (col.length > 0 && !col[col.length - 1].isFaceUp) {
          col[col.length - 1] = {
            ...col[col.length - 1],
            isFaceUp: true
          };
        }

        return { newTableau, completedRun: suit };
      }
    }
  }

  return { newTableau, completedRun: null };
};

// Get a hint for a valid move
// Prioritizes:
// 1. Move that builds a same-suit sequence.
// 2. Move that puts a card onto a different suit (still valid rank-wise).
// 3. Move to an empty column (usually best with a King or a long sequence).
export const getHint = (
  tableau: Card[][]
): { fromCol: number; cardIndex: number; toCol: number } | null => {
  const moves: { fromCol: number; cardIndex: number; toCol: number; isSameSuit: boolean; weight: number }[] = [];

  for (let fromCol = 0; fromCol < 10; fromCol++) {
    const col = tableau[fromCol];
    for (let cardIndex = 0; cardIndex < col.length; cardIndex++) {
      // Check if we can select this sub-stack
      if (!canSelectCard(col, cardIndex)) continue;
      
      const movingCard = col[cardIndex];

      // Check all possible destination columns
      for (let toCol = 0; toCol < 10; toCol++) {
        if (fromCol === toCol) continue;
        
        const destCol = tableau[toCol];
        const destCard = destCol.length > 0 ? destCol[destCol.length - 1] : undefined;

        if (canPlaceOn(movingCard, destCard)) {
          const isSameSuit = destCard ? destCard.suit === movingCard.suit : false;
          
          // Avoid moving a card that is already sitting on a matching suit card
          // unless it exposes a face-down card or we are moving to an empty column
          const isAlreadyWellPlaced = cardIndex > 0 && 
            col[cardIndex - 1].isFaceUp && 
            col[cardIndex - 1].suit === movingCard.suit && 
            col[cardIndex - 1].rank === movingCard.rank + 1;
            
          if (isAlreadyWellPlaced && destCard) {
            // It's already well placed, moving it to another non-empty column isn't helpful unless it's to clean the column
            continue;
          }

          let weight = 0;
          if (isSameSuit) {
            weight += 10; // Same suit moves are highly preferred
          } else if (!destCard) {
            // Moving to empty column
            if (movingCard.rank === 13) {
              weight += 5; // Putting a King in an empty column is good
            } else if (cardIndex === 0) {
              // Emptying a column just to move a single card that was already the only one is useless
              weight += 1;
            } else {
              weight += 3;
            }
          } else {
            weight += 2; // Different suit move
          }

          // If moving exposes a face-down card, add weight
          const exposesFaceDown = cardIndex > 0 && !col[cardIndex - 1].isFaceUp;
          if (exposesFaceDown) {
            weight += 4;
          }

          moves.push({ fromCol, cardIndex, toCol, isSameSuit, weight });
        }
      }
    }
  }

  if (moves.length === 0) return null;

  // Sort by weight descending
  moves.sort((a, b) => b.weight - a.weight);
  
  return {
    fromCol: moves[0].fromCol,
    cardIndex: moves[0].cardIndex,
    toCol: moves[0].toCol
  };
};

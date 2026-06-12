import React, { useState, useEffect, useRef } from 'react';
import { 
  initializeGame, 
  canSelectCard, 
  isValidMove, 
  checkCompletedRuns, 
  getHint 
} from './utils/gameLogic';
import { 
  playShuffleSound, 
  playDealSound, 
  playMoveSound, 
  playFlipSound, 
  playCompleteRunSound, 
  playVictorySound,
  toggleMute as toggleMuteAudio,
  getMutedStatus
} from './utils/audio';
import type { Suit, Difficulty, GameState, GameHistoryState } from './types/game';
import { Header } from './components/Header';
import { TableauColumn } from './components/TableauColumn';
import { StockPile } from './components/StockPile';
import { Foundations } from './components/Foundations';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import './App.css';

const LOCAL_STORAGE_KEY = 'spider_solitaire_save';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    difficulty: 1,
    tableau: Array.from({ length: 10 }, () => []),
    stock: [],
    completedRuns: [],
    score: 500,
    movesCount: 0,
    startTime: null,
    elapsedTime: 0,
    isGameActive: false,
    victory: false,
    selectedCard: null
  });

  // Undo / Redo history stacks
  const [history, setHistory] = useState<GameHistoryState[]>([]);
  const [redoHistory, setRedoHistory] = useState<GameHistoryState[]>([]);

  // Other UI state
  const [isMuted, setIsMuted] = useState(getMutedStatus());
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [hintedCard, setHintedCard] = useState<{ fromCol: number; cardIndex: number; toCol: number } | null>(null);
  const [draggedStack, setDraggedStack] = useState<{ colIndex: number; cardIndex: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deriving state
  const hasEmptyColumns = gameState.tableau.some(col => col.length === 0);

  // Initialize game on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore game state
        setGameState(parsed.gameState);
        setHistory(parsed.history || []);
        setRedoHistory(parsed.redoHistory || []);
        return;
      } catch (e) {
        console.error('Failed to load saved game:', e);
      }
    }
    // Default to new game (Easy)
    startNewGame(1, false);
  }, []);

  // Save game state to localStorage
  const saveToLocalStorage = (state: GameState, hist: GameHistoryState[], redoHist: GameHistoryState[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      gameState: {
        ...state,
        selectedCard: null // Don't persist selection
      },
      history: hist,
      redoHistory: redoHist
    }));
  };

  // Timer Effect
  useEffect(() => {
    if (gameState.isGameActive && gameState.startTime !== null && !gameState.victory) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const next = {
            ...prev,
            elapsedTime: prev.elapsedTime + 1
          };
          // Save every few seconds or let the state handle it (we'll save on every move instead)
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isGameActive, gameState.startTime, gameState.victory]);

  // Keyboard Shortcuts (Undo, Redo, Hint, New Game)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside input elements if they exist
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (isCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleHint();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, history, redoHistory]);

  // Push the current state to the undo history stack
  const pushHistory = (state: GameState) => {
    const snapshot: GameHistoryState = {
      tableau: state.tableau.map(col => col.map(c => ({ ...c }))),
      stock: state.stock.map(c => ({ ...c })),
      completedRuns: [...state.completedRuns],
      score: state.score,
      movesCount: state.movesCount
    };
    const newHistory = [...history, snapshot];
    setHistory(newHistory);
    setRedoHistory([]); // Clear redo stack on new action
    return newHistory;
  };

  // Start a new game
  const startNewGame = (diff: Difficulty, showConfirm = true) => {
    if (showConfirm && gameState.movesCount > 0 && !gameState.victory) {
      const confirm = window.confirm('Are you sure you want to start a new game? Your current progress will be lost.');
      if (!confirm) return;
    }

    // Reset hint
    setHintedCard(null);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);

    // Get shuffled deck and initial deal
    const { tableau, stock } = initializeGame(diff);
    
    const newState: GameState = {
      difficulty: diff,
      tableau,
      stock,
      completedRuns: [],
      score: 500,
      movesCount: 0,
      startTime: null,
      elapsedTime: 0,
      isGameActive: false, // Wait until first move to activate timer
      victory: false,
      selectedCard: null
    };

    setGameState(newState);
    setHistory([]);
    setRedoHistory([]);
    playShuffleSound();

    saveToLocalStorage(newState, [], []);
  };

  // Deal cards from stock (1 card to each column)
  const handleDeal = () => {
    if (gameState.stock.length === 0) return;
    
    if (hasEmptyColumns) {
      alert('You cannot deal cards when there are empty columns on the board. Fill them first!');
      return;
    }

    // Capture history
    const hist = pushHistory(gameState);

    // Pop 10 cards
    const remainingStock = [...gameState.stock];
    const cardsToDeal = remainingStock.splice(remainingStock.length - 10, 10);
    
    // Deal one to each column
    let newTableau = gameState.tableau.map((col, index) => {
      const card = cardsToDeal[index];
      card.isFaceUp = true; // Dealt cards are always face up
      return [...col, card];
    });

    // Check if dealing automatically completed any runs (rare but possible)
    let completedRunsList = [...gameState.completedRuns];
    let newScore = gameState.score - 1; // Dealing costs 1 move point
    let totalCompletedThisDeal = 0;

    let runCheckResult = checkCompletedRuns(newTableau);
    while (runCheckResult.completedRun !== null) {
      newTableau = runCheckResult.newTableau;
      completedRunsList.push(runCheckResult.completedRun);
      totalCompletedThisDeal++;
      runCheckResult = checkCompletedRuns(newTableau);
    }

    if (totalCompletedThisDeal > 0) {
      newScore += totalCompletedThisDeal * 100;
      setTimeout(() => playCompleteRunSound(), 300);
    }

    const nextState: GameState = {
      ...gameState,
      tableau: newTableau,
      stock: remainingStock,
      completedRuns: completedRunsList,
      score: newScore,
      movesCount: gameState.movesCount + 1,
      isGameActive: true,
      startTime: gameState.startTime || Date.now()
    };

    playDealSound();
    setGameState(nextState);
    saveToLocalStorage(nextState, hist, []);
    setHintedCard(null);
  };

  // Check if board has been cleared (victory check)
  const checkVictory = (completedRuns: Suit[]) => {
    return completedRuns.length === 8;
  };

  // Handle card selection / click-to-move
  const handleSelectCard = (colIndex: number, cardIndex: number, _event: React.MouseEvent) => {
    // Dismiss hint
    setHintedCard(null);

    // Case 1: Clicked an empty column
    if (cardIndex === -1) {
      if (gameState.selectedCard) {
        // Try to move currently selected card to this empty column
        moveSelectedCards(gameState.selectedCard.colIndex, gameState.selectedCard.cardIndex, colIndex);
      }
      return;
    }

    const clickedCard = gameState.tableau[colIndex][cardIndex];

    // Case 2: No card is selected yet
    if (!gameState.selectedCard) {
      if (clickedCard.isFaceUp && canSelectCard(gameState.tableau[colIndex], cardIndex)) {
        setGameState(prev => ({
          ...prev,
          selectedCard: { colIndex, cardIndex }
        }));
      }
      return;
    }

    // Case 3: A card is already selected
    const { colIndex: sourceCol, cardIndex: sourceCardIdx } = gameState.selectedCard;

    // Clicking the same card or same stack cancels selection
    if (sourceCol === colIndex) {
      setGameState(prev => ({ ...prev, selectedCard: null }));
      return;
    }

    // Check if we can move selected cards to the clicked column
    const sourceColCards = gameState.tableau[sourceCol];
    const movingStack = sourceColCards.slice(sourceCardIdx);

    if (isValidMove(movingStack, gameState.tableau[colIndex])) {
      moveSelectedCards(sourceCol, sourceCardIdx, colIndex);
    } else {
      // If move is invalid, check if we can select the newly clicked card instead
      if (clickedCard.isFaceUp && canSelectCard(gameState.tableau[colIndex], cardIndex)) {
        setGameState(prev => ({
          ...prev,
          selectedCard: { colIndex, cardIndex }
        }));
      } else {
        // Otherwise, clear selection
        setGameState(prev => ({ ...prev, selectedCard: null }));
      }
    }
  };

  // Perform card moving (works for both Drag and Click-to-Move)
  const moveSelectedCards = (fromCol: number, fromCardIdx: number, toCol: number) => {
    const hist = pushHistory(gameState);

    let newTableau = gameState.tableau.map(col => [...col]);
    const movingCards = newTableau[fromCol].splice(fromCardIdx);

    // Append to destination
    newTableau[toCol] = [...newTableau[toCol], ...movingCards];

    // Play move sound
    playMoveSound();

    let didFlip = false;
    // Flip new top card of source column if face down
    if (newTableau[fromCol].length > 0 && !newTableau[fromCol][newTableau[fromCol].length - 1].isFaceUp) {
      newTableau[fromCol][newTableau[fromCol].length - 1] = {
        ...newTableau[fromCol][newTableau[fromCol].length - 1],
        isFaceUp: true
      };
      didFlip = true;
      // Play flip sound shortly after
      setTimeout(() => playFlipSound(), 150);
    }

    // Check for completed runs in the target column
    let completedRunsList = [...gameState.completedRuns];
    let newScore = gameState.score - 1; // Move costs 1 point
    let totalCompletedThisMove = 0;

    let runCheckResult = checkCompletedRuns(newTableau);
    while (runCheckResult.completedRun !== null) {
      newTableau = runCheckResult.newTableau;
      completedRunsList.push(runCheckResult.completedRun);
      totalCompletedThisMove++;
      runCheckResult = checkCompletedRuns(newTableau);
    }

    if (totalCompletedThisMove > 0) {
      newScore += totalCompletedThisMove * 100;
      setTimeout(() => playCompleteRunSound(), didFlip ? 350 : 200);
    }

    const isVictor = checkVictory(completedRunsList);
    if (isVictor) {
      setTimeout(() => playVictorySound(), 1000);
    }

    const nextState: GameState = {
      ...gameState,
      tableau: newTableau,
      completedRuns: completedRunsList,
      score: newScore,
      movesCount: gameState.movesCount + 1,
      isGameActive: true,
      startTime: gameState.startTime || Date.now(),
      victory: isVictor,
      selectedCard: null // Clear selection
    };

    setGameState(nextState);
    saveToLocalStorage(nextState, hist, []);
    setHintedCard(null);
  };

  // Drag and Drop dropping handler
  const handleDropCards = (fromCol: number, fromCardIdx: number, toCol: number) => {
    moveSelectedCards(fromCol, fromCardIdx, toCol);
    setDraggedStack(null);
  };

  // Set globally tracked dragged stack for valid target highlighting
  const handleDragStartGlobal = (colIndex: number, cardIndex: number) => {
    setDraggedStack({ colIndex, cardIndex });
    setGameState(prev => ({ ...prev, selectedCard: null })); // Clear selection during drag
  };

  const handleDragEndGlobal = () => {
    setDraggedStack(null);
  };

  // Undo operation
  const handleUndo = () => {
    if (history.length === 0) return;

    // Dismiss hint
    setHintedCard(null);

    const prevSnapshot = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Push current state to redo stack
    const redoSnapshot: GameHistoryState = {
      tableau: gameState.tableau.map(col => col.map(c => ({ ...c }))),
      stock: gameState.stock.map(c => ({ ...c })),
      completedRuns: [...gameState.completedRuns],
      score: gameState.score,
      movesCount: gameState.movesCount
    };

    setHistory(newHistory);
    setRedoHistory(prev => [...prev, redoSnapshot]);

    // Apply state
    const nextState: GameState = {
      ...gameState,
      tableau: prevSnapshot.tableau,
      stock: prevSnapshot.stock,
      completedRuns: prevSnapshot.completedRuns,
      score: prevSnapshot.score,
      movesCount: prevSnapshot.movesCount,
      selectedCard: null
    };

    setGameState(nextState);
    playFlipSound();
    saveToLocalStorage(nextState, newHistory, [...redoHistory, redoSnapshot]);
  };

  // Redo operation
  const handleRedo = () => {
    if (redoHistory.length === 0) return;

    // Dismiss hint
    setHintedCard(null);

    const nextSnapshot = redoHistory[redoHistory.length - 1];
    const newRedoHistory = redoHistory.slice(0, -1);

    // Push current to undo stack
    const undoSnapshot: GameHistoryState = {
      tableau: gameState.tableau.map(col => col.map(c => ({ ...c }))),
      stock: gameState.stock.map(c => ({ ...c })),
      completedRuns: [...gameState.completedRuns],
      score: gameState.score,
      movesCount: gameState.movesCount
    };

    setHistory(prev => [...prev, undoSnapshot]);
    setRedoHistory(newRedoHistory);

    // Apply state
    const nextState: GameState = {
      ...gameState,
      tableau: nextSnapshot.tableau,
      stock: nextSnapshot.stock,
      completedRuns: nextSnapshot.completedRuns,
      score: nextSnapshot.score,
      movesCount: nextSnapshot.movesCount,
      selectedCard: null
    };

    setGameState(nextState);
    playFlipSound();
    saveToLocalStorage(nextState, [...history, undoSnapshot], newRedoHistory);
  };

  // Get and highlight a hint
  const handleHint = () => {
    const hint = getHint(gameState.tableau);
    if (!hint) {
      alert('No valid moves available. Deal from stock!');
      return;
    }

    setHintedCard(hint);

    // Clear hint after 4 seconds
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setHintedCard(null);
    }, 4000);
  };

  // Change difficulty
  const handleChangeDifficulty = (newDiff: Difficulty) => {
    startNewGame(newDiff, true);
  };

  // Toggle audio
  const handleToggleMute = () => {
    const muted = toggleMuteAudio();
    setIsMuted(muted);
  };

  const handleRestart = () => {
    startNewGame(gameState.difficulty, true);
  };

  return (
    <div className="app-container" onClick={() => setGameState(prev => ({ ...prev, selectedCard: null }))}>
      <Header
        score={gameState.score}
        movesCount={gameState.movesCount}
        elapsedTime={gameState.elapsedTime}
        difficulty={gameState.difficulty}
        isMuted={isMuted}
        canUndo={history.length > 0}
        canRedo={redoHistory.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onRestart={handleRestart}
        onHint={handleHint}
        onToggleMute={handleToggleMute}
        onOpenRules={() => setIsRulesOpen(true)}
        onChangeDifficulty={handleChangeDifficulty}
      />

      {/* Main Playing Tableau Board */}
      <main className="game-board">
        <div className="tableau-grid">
          {gameState.tableau.map((column, colIdx) => (
            <TableauColumn
              key={colIdx}
              cards={column}
              colIndex={colIdx}
              selectedCard={gameState.selectedCard}
              hintedCard={hintedCard}
              draggedStack={draggedStack}
              allTableaus={gameState.tableau}
              onSelectCard={handleSelectCard}
              onDropCards={handleDropCards}
              onDragStartGlobal={handleDragStartGlobal}
              onDragEndGlobal={handleDragEndGlobal}
            />
          ))}
        </div>
      </main>

      {/* Footer Info & Stock/Foundations Area */}
      <footer className="game-footer-deck">
        <Foundations completedRuns={gameState.completedRuns} />
        <StockPile 
          remainingDeals={Math.ceil(gameState.stock.length / 10)} 
          onClick={handleDeal}
          hasEmptyColumns={hasEmptyColumns}
        />
      </footer>

      {/* Modals */}
      <RulesModal 
        isOpen={isRulesOpen} 
        onClose={() => setIsRulesOpen(false)} 
      />

      <VictoryModal 
        isOpen={gameState.victory}
        score={gameState.score}
        moves={gameState.movesCount}
        time={gameState.elapsedTime}
        difficulty={gameState.difficulty}
        onRestart={() => startNewGame(gameState.difficulty, false)}
      />
    </div>
  );
}

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
import type { Card, Suit, Difficulty, GameState, GameHistoryState } from './types/game';
import { Header } from './components/Header';
import { TableauColumn } from './components/TableauColumn';
import { StockPile } from './components/StockPile';
import { Foundations } from './components/Foundations';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import { CheatPanel } from './components/CheatPanel';
import { SettingsModal, type GameSettings } from './components/SettingsModal';
import { useLanguage } from './i18n';
import './App.css';

const LOCAL_STORAGE_KEY = 'spider_solitaire_save';
const SETTINGS_LOCAL_STORAGE_KEY = 'spider_solitaire_settings';

const DEFAULT_SETTINGS: GameSettings = {
  easySuit: 'spades',
  mediumSuits: ['spades', 'hearts'],
  maxCheats: 10,
  initialScore: 500,
  moveCost: 1,
  runBonus: 100,
  easyMinQuality: 20,
  easyMaxAttempts: 100,
  mediumMinQuality: 14,
  mediumMaxAttempts: 60,
  hardMinQuality: 8,
  hardMaxAttempts: 30
};

export default function App() {
  const { lang, setLang, t } = useLanguage();

  // Settings state
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (_) {}
    }
    return DEFAULT_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  // Cheat state
  const [cheatState, setCheatState] = useState({ totalUsed: 0, maxCheats: DEFAULT_SETTINGS.maxCheats, peekCount: 0, oracleCount: 0, freeMoveCount: 0 });
  const [isCheatPanelOpen, setIsCheatPanelOpen] = useState(false);
  const [peekMode, setPeekMode] = useState(false);
  const [peekedCardIds, setPeekedCardIds] = useState<Set<string>>(new Set());
  const [freeMoveActive, setFreeMoveActive] = useState(false);
  const [oracleCards, setOracleCards] = useState<Card[] | null>(null);

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
      const confirm = window.confirm(t.app.confirmRestart);
      if (!confirm) return;
    }

    // Reset hint
    setHintedCard(null);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);

    // Get shuffled deck and initial deal
    const customSuits = diff === 1 ? [settings.easySuit] : diff === 2 ? settings.mediumSuits : undefined;
    const targetMinQuality = diff === 1 ? settings.easyMinQuality : diff === 2 ? settings.mediumMinQuality : settings.hardMinQuality;
    const targetMaxAttempts = diff === 1 ? settings.easyMaxAttempts : diff === 2 ? settings.mediumMaxAttempts : settings.hardMaxAttempts;
    
    const { tableau, stock } = initializeGame(diff, customSuits, targetMinQuality, targetMaxAttempts);
    
    const newState: GameState = {
      difficulty: diff,
      tableau,
      stock,
      completedRuns: [],
      score: settings.initialScore,
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
    setCheatState({ totalUsed: 0, maxCheats: settings.maxCheats, peekCount: 0, oracleCount: 0, freeMoveCount: 0 });
    setPeekMode(false);
    setPeekedCardIds(new Set());
    setFreeMoveActive(false);
    setOracleCards(null);
    playShuffleSound();

    saveToLocalStorage(newState, [], []);
  };

  // Deal cards from stock (1 card to each column)
  const handleDeal = () => {
    if (gameState.stock.length === 0) return;
    
    if (hasEmptyColumns) {
      alert(t.app.alertEmptyColumns);
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
      newScore += totalCompletedThisDeal * settings.runBonus;
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

    if (freeMoveActive || isValidMove(movingStack, gameState.tableau[colIndex])) {
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
    let newScore = gameState.score - settings.moveCost; // Move costs moveCost points
    let totalCompletedThisMove = 0;

    let runCheckResult = checkCompletedRuns(newTableau);
    while (runCheckResult.completedRun !== null) {
      newTableau = runCheckResult.newTableau;
      completedRunsList.push(runCheckResult.completedRun);
      totalCompletedThisMove++;
      runCheckResult = checkCompletedRuns(newTableau);
    }

    if (totalCompletedThisMove > 0) {
      newScore += totalCompletedThisMove * settings.runBonus;
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

    if (freeMoveActive) {
      setFreeMoveActive(false);
    }
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
      alert(t.app.alertNoMoves);
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

  const handlePeekCard = (cardId: string) => {
    setPeekedCardIds(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
    setCheatState(prev => ({
      ...prev,
      totalUsed: prev.totalUsed + 1,
      peekCount: prev.peekCount + 1
    }));
    setPeekMode(false);
    playFlipSound();
    setTimeout(() => {
      setPeekedCardIds(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }, 2000);
  };

  const handleCancelPeek = () => {
    setPeekMode(false);
  };

  const handleActivateOracle = () => {
    if (gameState.stock.length === 0) {
      setOracleCards([]);
      return;
    }
    const next10 = gameState.stock.slice(gameState.stock.length - 10);
    setOracleCards(next10);
    setCheatState(prev => ({
      ...prev,
      totalUsed: prev.totalUsed + 1,
      oracleCount: prev.oracleCount + 1
    }));
    setIsCheatPanelOpen(false);
  };

  const handleDismissOracle = () => {
    setOracleCards(null);
  };

  const handleActivateFreeMove = () => {
    setFreeMoveActive(true);
    setCheatState(prev => ({
      ...prev,
      totalUsed: prev.totalUsed + 1,
      freeMoveCount: prev.freeMoveCount + 1
    }));
    setIsCheatPanelOpen(false);
  };

  const handleCancelFreeMove = () => {
    setFreeMoveActive(false);
    setCheatState(prev => ({
      ...prev,
      totalUsed: Math.max(0, prev.totalUsed - 1),
      freeMoveCount: Math.max(0, prev.freeMoveCount - 1)
    }));
  };

  const handleInstantWin = () => {
    setIsCheatPanelOpen(false);
    setGameState(prev => ({
      ...prev,
      victory: true,
      score: 9999
    }));
    playVictorySound();
  };

  const handleRestart = () => {
    startNewGame(gameState.difficulty, true);
  };

  const handleSaveSettings = (newSettings: GameSettings, shouldRestart: boolean) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
    
    // Update active cheat state maxCheats dynamically
    setCheatState(prev => ({
      ...prev,
      maxCheats: newSettings.maxCheats
    }));

    if (shouldRestart) {
      startNewGame(gameState.difficulty, false);
    }
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
        lang={lang}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onRestart={handleRestart}
        onHint={handleHint}
        onToggleMute={handleToggleMute}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onChangeDifficulty={handleChangeDifficulty}
        onToggleLanguage={() => setLang(lang === 'zh' ? 'en' : 'zh')}
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
              peekMode={peekMode}
              peekedCardIds={peekedCardIds}
              freeMoveActive={freeMoveActive}
              onPeekCard={handlePeekCard}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Cheat Panel & Mode indicators */}
      <CheatPanel
        isOpen={isCheatPanelOpen}
        onOpen={() => setIsCheatPanelOpen(true)}
        onClose={() => setIsCheatPanelOpen(false)}
        cheatState={cheatState}
        onActivatePeek={() => { setPeekMode(true); setIsCheatPanelOpen(false); }}
        onActivateOracle={handleActivateOracle}
        onActivateFreeMove={handleActivateFreeMove}
        onInstantWin={handleInstantWin}
        oracleCards={oracleCards}
        onDismissOracle={handleDismissOracle}
        stockEmpty={gameState.stock.length === 0}
        peekMode={peekMode}
        freeMoveActive={freeMoveActive}
        onCancelPeek={handleCancelPeek}
        onCancelFreeMove={handleCancelFreeMove}
      />
    </div>
  );
}

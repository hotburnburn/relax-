import React from 'react';
import { 
  Undo2, 
  Redo2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Lightbulb
} from 'lucide-react';
import type { Difficulty } from '../types/game';
import './Header.css';

interface HeaderProps {
  score: number;
  movesCount: number;
  elapsedTime: number;
  difficulty: Difficulty;
  isMuted: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRestart: () => void;
  onHint: () => void;
  onToggleMute: () => void;
  onOpenRules: () => void;
  onChangeDifficulty: (diff: Difficulty) => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  movesCount,
  elapsedTime,
  difficulty,
  isMuted,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRestart,
  onHint,
  onToggleMute,
  onOpenRules,
  onChangeDifficulty
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiff = parseInt(e.target.value) as Difficulty;
    onChangeDifficulty(newDiff);
  };

  return (
    <header className="game-header">
      <div className="header-top">
        <div className="game-logo">
          {/* Custom Spider SVG */}
          <svg viewBox="0 0 24 24" className="spider-logo-icon">
            <circle cx="12" cy="13" r="3.2" fill="currentColor"/>
            <circle cx="12" cy="7.2" r="1.8" fill="currentColor"/>
            <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8.8 13C6.5 12 4.5 14 3.5 16M8.8 14C5.8 14 3.8 17 2.8 20M8.8 12C6.8 10 4.8 9 3.8 7M15.2 13C17.5 12 19.5 14 20.5 16M15.2 14C18.2 14 20.2 17 21.2 20M15.2 12C17.2 10 19.2 9 20.2 7" fill="none" />
          </svg>
          <h1>Spider Cards</h1>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          <button 
            className="action-btn icon-btn" 
            onClick={onUndo} 
            disabled={!canUndo}
            title="Undo Move (Ctrl+Z)"
          >
            <Undo2 size={18} />
            <span className="btn-label">Undo</span>
          </button>
          
          <button 
            className="action-btn icon-btn" 
            onClick={onRedo} 
            disabled={!canRedo}
            title="Redo Move (Ctrl+Y)"
          >
            <Redo2 size={18} />
            <span className="btn-label">Redo</span>
          </button>

          <button 
            className="action-btn icon-btn hint-btn" 
            onClick={onHint}
            title="Get a Hint (H)"
          >
            <Lightbulb size={18} className="hint-bulb" />
            <span className="btn-label">Hint</span>
          </button>

          <div className="divider" />

          <button 
            className="action-btn icon-btn" 
            onClick={onToggleMute}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button 
            className="action-btn icon-btn" 
            onClick={onOpenRules}
            title="Game Rules"
          >
            <HelpCircle size={18} />
          </button>

          <button 
            className="action-btn icon-btn restart-btn" 
            onClick={onRestart}
            title="Restart Game"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="header-bottom">
        {/* Difficulty Select */}
        <div className="difficulty-container">
          <label htmlFor="difficulty-select">Difficulty:</label>
          <select 
            id="difficulty-select" 
            value={difficulty} 
            onChange={handleDifficultyChange}
            className="difficulty-select"
          >
            <option value={1}>Easy (1 Suit - ♠)</option>
            <option value={2}>Medium (2 Suits - ♠ ♥)</option>
            <option value={4}>Hard (4 Suits - ♠ ♥ ♦ ♣)</option>
          </select>
        </div>

        {/* Scoreboard */}
        <div className="scoreboard">
          <div className="score-stat">
            <span className="stat-label">Score</span>
            <span className="stat-value highlight">{score}</span>
          </div>

          <div className="score-stat">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{movesCount}</span>
          </div>

          <div className="score-stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

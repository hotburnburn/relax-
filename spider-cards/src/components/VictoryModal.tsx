import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Clock, Hash, Star } from 'lucide-react';
import type { Difficulty } from '../types/game';
import { useLanguage } from '../i18n';
import './VictoryModal.css';

interface VictoryModalProps {
  isOpen: boolean;
  score: number;
  moves: number;
  time: number; // in seconds
  difficulty: Difficulty;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  score,
  moves,
  time,
  difficulty,
  onRestart
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      const duration = 6 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1200 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Shoot confetti from left and right sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (diff: Difficulty): string => {
    switch (diff) {
      case 1: return t.victory.difficultyEasy;
      case 2: return t.victory.difficultyMedium;
      case 4: return t.victory.difficultyHard;
      default: return '';
    }
  };

  return (
    <div className="victory-overlay">
      <div className="victory-modal-content">
        <div className="victory-crown-container">
          <div className="trophy-pulse-ring" />
          <Trophy className="victory-trophy-icon" />
        </div>
        
        <h1 className="victory-title">{t.victory.title}</h1>
        <p className="victory-subtitle">{t.victory.subtitle}</p>
        
        <div className="victory-stats-grid">
          <div className="victory-stat-card">
            <Star className="victory-stat-icon difficulty" />
            <span className="victory-stat-label">{t.victory.difficultyLabel}</span>
            <span className="victory-stat-value">{getDifficultyLabel(difficulty)}</span>
          </div>
          
          <div className="victory-stat-card">
            <span className="victory-stat-icon score-icon">🏆</span>
            <span className="victory-stat-label">{t.victory.finalScoreLabel}</span>
            <span className="victory-stat-value highlight">{score}</span>
          </div>

          <div className="victory-stat-card">
            <Hash className="victory-stat-icon moves" />
            <span className="victory-stat-label">{t.victory.totalMovesLabel}</span>
            <span className="victory-stat-value">{moves}</span>
          </div>

          <div className="victory-stat-card">
            <Clock className="victory-stat-icon time" />
            <span className="victory-stat-label">{t.victory.timeTakenLabel}</span>
            <span className="victory-stat-value">{formatTime(time)}</span>
          </div>
        </div>

        <button className="victory-restart-btn" onClick={onRestart}>
          <RefreshCw size={20} />
          {t.victory.playAgainButton}
        </button>
      </div>
    </div>
  );
};

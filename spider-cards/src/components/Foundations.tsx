import React from 'react';
import type { Suit } from '../types/game';
import { SuitIcon } from './CardView';
import { useLanguage } from '../i18n';
import './Foundations.css';

interface FoundationsProps {
  completedRuns: Suit[];
}

export const Foundations: React.FC<FoundationsProps> = ({ completedRuns }) => {
  const { t } = useLanguage();

  // Always display 8 slots
  return (
    <div className="foundations-container">
      <div className="foundations-info">
        <span className="foundations-title">{t.foundations.title}</span>
        <span className="foundations-count">({completedRuns.length} / 8)</span>
      </div>
      
      <div className="foundations-slots-wrapper">
        {Array.from({ length: 8 }).map((_, idx) => {
          const completedSuit = completedRuns[idx];
          const isRed = completedSuit === 'hearts' || completedSuit === 'diamonds';
          
          return (
            <div 
              key={idx} 
              className={`foundation-slot ${completedSuit ? 'filled' : 'empty'} ${completedSuit && isRed ? 'red-suit' : 'black-suit'}`}
            >
              {completedSuit ? (
                // Display King of completed suit
                <div className="foundation-card">
                  <div className="foundation-card-corner">
                    <span className="foundation-card-rank">K</span>
                    <SuitIcon suit={completedSuit} className="suit-mini" />
                  </div>
                  <SuitIcon suit={completedSuit} className="suit-main-completed" />
                  <div className="foundation-card-glow" />
                </div>
              ) : (
                // Display empty slot placeholder
                <div className="foundation-placeholder">
                  <svg viewBox="0 0 24 24" className="placeholder-k-icon">
                    {/* An elegant crown icon or silhouette representing K */}
                    <path fill="currentColor" d="M12 2L9 7l-5-1 3 8-4 5h18l-4-5 3-8-5 1-3-5Z" opacity="0.1" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

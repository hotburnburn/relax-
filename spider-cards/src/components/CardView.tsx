import React from 'react';
import type { Card, Suit } from '../types/game';
import './CardView.css';

// Suit SVG component for clean vectors
export const SuitIcon: React.FC<{ suit: Suit; className?: string }> = ({ suit, className = 'suit-icon' }) => {
  const color = (suit === 'hearts' || suit === 'diamonds') ? 'var(--card-red)' : 'var(--card-black)';
  
  if (suit === 'spades') {
    return (
      <svg viewBox="0 0 24 24" className={`${className} spades`} style={{ color }}>
        <path fill="currentColor" d="M12 2C11.5 2 6 9.5 6 13c0 3 2.5 5 6 5s6-2 6-5c0-3.5-5.5-11-6-11Z" />
        <path fill="currentColor" d="M12 15.5c-.8 0-1.5 1.5-2.2 3.5h4.4c-.7-2-1.4-3.5-2.2-3.5Z" />
      </svg>
    );
  }
  if (suit === 'hearts') {
    return (
      <svg viewBox="0 0 24 24" className={`${className} hearts`} style={{ color }}>
        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
      </svg>
    );
  }
  if (suit === 'diamonds') {
    return (
      <svg viewBox="0 0 24 24" className={`${className} diamonds`} style={{ color }}>
        <path fill="currentColor" d="M12 2L3.5 12L12 22L20.5 12L12 2Z" />
      </svg>
    );
  }
  // clubs
  return (
    <svg viewBox="0 0 24 24" className={`${className} clubs`} style={{ color }}>
      <circle fill="currentColor" cx="12" cy="7.5" r="4.2" />
      <circle fill="currentColor" cx="7.2" cy="13.2" r="4.2" />
      <circle fill="currentColor" cx="16.8" cy="13.2" r="4.2" />
      <path fill="currentColor" d="M12 13.5c-.8 0-1.5 1.5-2.2 5.5h4.4c-.7-4-1.4-5.5-2.2-5.5Z" />
    </svg>
  );
};

interface CardViewProps {
  card: Card;
  colIndex: number;
  cardIndex: number;
  isSelected: boolean;
  isHinted: boolean;
  isDraggable: boolean;
  onSelect: (colIndex: number, cardIndex: number, event: React.MouseEvent) => void;
  onDragStart: () => void;
  onDragEnd?: () => void;
  children?: React.ReactNode;
}


export const CardView: React.FC<CardViewProps> = ({
  card,
  colIndex,
  cardIndex,
  isSelected,
  isHinted,
  isDraggable,
  onSelect,
  onDragStart,
  onDragEnd,
  children
}) => {
  const getRankLabel = (rank: number): string => {
    switch (rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return rank.toString();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    // Set data for transfer
    e.dataTransfer.setData('text/plain', JSON.stringify({ colIndex, cardIndex }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class to element
    const el = e.currentTarget as HTMLElement;
    el.classList.add('dragging');

    // Notify parent
    onDragStart();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('dragging');
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(colIndex, cardIndex, e);
  };

  const label = getRankLabel(card.rank);
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const cardClasses = [
    'card-item',
    card.isFaceUp ? 'face-up' : 'face-down',
    isSelected ? 'selected' : '',
    isHinted ? 'hinted' : '',
    isDraggable ? 'draggable' : '',
    isRed ? 'red-suit' : 'black-suit'
  ].join(' ');

  // Calculate vertical offset for stacking
  // Face-down cards can be closer together (e.g. 15px), face-up cards can be further apart (e.g. 25px)
  // Since we are nesting, the offset is applied as top margin/padding on the child container.
  const offsetStyle = cardIndex > 0 ? {
    marginTop: card.isFaceUp ? 'var(--offset-face-up)' : 'var(--offset-face-down)'
  } : {};

  return (
    <div
      className={cardClasses}
      style={offsetStyle}
      draggable={isDraggable && card.isFaceUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      {card.isFaceUp ? (
        // Face Up Content
        <div className="card-face">
          <div className="card-corner top-left">
            <span className="card-rank">{label}</span>
            <SuitIcon suit={card.suit} className="suit-mini" />
          </div>
          
          <div className="card-center">
            <SuitIcon suit={card.suit} className="suit-main" />
          </div>
          
          <div className="card-corner bottom-right">
            <span className="card-rank">{label}</span>
            <SuitIcon suit={card.suit} className="suit-mini" />
          </div>

          {/* Golden borders for high ranks (K, Q, J) */}
          {card.rank >= 11 && <div className="card-royal-border" />}
        </div>
      ) : (
        // Face Down Content
        <div className="card-back">
          <div className="card-back-pattern">
            <div className="card-back-inner-frame">
              <svg viewBox="0 0 60 90" className="card-back-mesh">
                {/* Geometrical mesh pattern for premium feel */}
                <path d="M 0,0 L 60,90 M 60,0 L 0,90 M 30,0 L 30,90 M 0,45 L 60,45" stroke="var(--card-back-gold)" strokeWidth="0.5" opacity="0.3" fill="none" />
                <rect x="5" y="5" width="50" height="80" rx="3" stroke="var(--card-back-gold)" strokeWidth="0.8" fill="none" opacity="0.6" />
                <circle cx="30" cy="45" r="12" stroke="var(--card-back-gold)" strokeWidth="1" fill="none" opacity="0.7" />
                <circle cx="30" cy="45" r="6" stroke="var(--card-back-gold)" strokeWidth="0.5" fill="none" opacity="0.5" />
                {/* Small central symbol */}
                <polygon points="30,41 34,45 30,49 26,45" fill="var(--card-back-gold)" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Nested Child Card */}
      {children && (
        <div className="nested-card-container">
          {children}
        </div>
      )}
    </div>
  );
};

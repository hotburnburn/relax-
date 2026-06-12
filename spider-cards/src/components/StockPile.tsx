import React from 'react';
import './StockPile.css';

interface StockPileProps {
  remainingDeals: number;
  onClick: () => void;
  hasEmptyColumns: boolean;
}

export const StockPile: React.FC<StockPileProps> = ({
  remainingDeals,
  onClick,
  hasEmptyColumns
}) => {
  const handleClick = () => {
    if (remainingDeals > 0) {
      onClick();
    }
  };

  const getTooltipText = (): string => {
    if (remainingDeals === 0) return 'No cards left in stock';
    if (hasEmptyColumns) return 'Fill all empty columns before dealing';
    return `Click to deal 10 cards (${remainingDeals} remaining)`;
  };

  return (
    <div className="stock-pile-container" title={getTooltipText()}>
      <div className="stock-info">
        <span className="stock-title">Stock</span>
        <span className="stock-count">({remainingDeals} deals)</span>
      </div>
      
      <div 
        className={`stock-cards-wrapper ${remainingDeals === 0 ? 'empty' : ''} ${hasEmptyColumns ? 'prevent-deal' : ''}`}
        onClick={handleClick}
      >
        {remainingDeals > 0 ? (
          // Render overlapping cards representing remaining deals
          Array.from({ length: remainingDeals }).map((_, idx) => {
            const offsetStyle = {
              transform: `translateX(${idx * 8}px) translateY(-${idx * 1.5}px)`,
              zIndex: idx
            };
            
            return (
              <div 
                key={idx}
                className="stock-card-back"
                style={offsetStyle}
              >
                <div className="stock-card-pattern">
                  <div className="stock-card-frame">
                    <svg viewBox="0 0 60 90" className="stock-card-mesh">
                      <rect x="5" y="5" width="50" height="80" rx="3" stroke="var(--card-back-gold)" strokeWidth="0.8" fill="none" opacity="0.4" />
                      <circle cx="30" cy="45" r="8" stroke="var(--card-back-gold)" strokeWidth="0.8" fill="none" opacity="0.4" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Empty stock slot
          <div className="empty-stock-slot">
            <svg viewBox="0 0 24 24" className="empty-stock-icon">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" opacity="0.4" />
            </svg>
          </div>
        )}
      </div>
      
      {hasEmptyColumns && remainingDeals > 0 && (
        <span className="stock-warning">Empty columns exist!</span>
      )}
    </div>
  );
};

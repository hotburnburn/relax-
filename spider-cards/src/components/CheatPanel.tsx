import React from 'react';
import { Sparkles, X, Eye, Compass, Wind } from 'lucide-react';
import { useLanguage } from '../i18n';
import type { Card } from '../types/game';
import { CardView, SuitIcon } from './CardView';
import './CheatPanel.css';

export interface CheatState {
  totalUsed: number;
  maxCheats: number;
  peekCount: number;
  oracleCount: number;
  freeMoveCount: number;
}

interface CheatPanelProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  cheatState: CheatState;
  onActivatePeek: () => void;
  onActivateOracle: () => void;
  onActivateFreeMove: () => void;
  onInstantWin: () => void;
  // Oracle overlay
  oracleCards: Card[] | null;
  onDismissOracle: () => void;
  stockEmpty: boolean;
  // Mode indicators
  peekMode: boolean;
  freeMoveActive: boolean;
  onCancelPeek: () => void;
  onCancelFreeMove: () => void;
}

export const CheatPanel: React.FC<CheatPanelProps> = ({
  isOpen,
  onOpen,
  onClose,
  cheatState,
  onActivatePeek,
  onActivateOracle,
  onActivateFreeMove,
  onInstantWin,
  oracleCards,
  onDismissOracle,
  stockEmpty,
  peekMode,
  freeMoveActive,
  onCancelPeek,
  onCancelFreeMove
}) => {
  const { t } = useLanguage();
  const remaining = cheatState.maxCheats - cheatState.totalUsed;
  const allUsed = remaining <= 0;

  const getRankLabel = (rank: number): string => {
    switch (rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return rank.toString();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="cheat-float-btn"
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        title={t.cheat.panelTitle}
      >
        <Sparkles size={22} />
      </button>

      {/* Mode Indicators */}
      {peekMode && (
        <div className="cheat-mode-indicator" onClick={(e) => e.stopPropagation()}>
          <Eye size={16} />
          <span>{t.cheat.peekModeActive}</span>
          <button className="cheat-mode-cancel-btn" onClick={onCancelPeek}>✕</button>
        </div>
      )}

      {freeMoveActive && (
        <div className="cheat-mode-indicator" onClick={(e) => e.stopPropagation()}>
          <Wind size={16} />
          <span>{t.cheat.freeMoveModeActive}</span>
          <button className="cheat-mode-cancel-btn" onClick={onCancelFreeMove}>✕</button>
        </div>
      )}

      {/* Cheat Panel Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="cheat-modal-content" onClick={e => e.stopPropagation()}>
            <div className="cheat-modal-header">
              <div className="cheat-modal-title">
                <Sparkles className="cheat-title-icon" />
                <h2>{t.cheat.panelTitle}</h2>
              </div>
              <button className="cheat-close-btn" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* Remaining Uses */}
            <div className="cheat-remaining">
              <div className="cheat-remaining-text">
                <span>{t.cheat.remaining(cheatState.totalUsed, cheatState.maxCheats)}</span>
              </div>
              <div className="cheat-progress-bar">
                <div
                  className="cheat-progress-fill"
                  style={{ width: `${(remaining / cheatState.maxCheats) * 100}%` }}
                />
              </div>
            </div>

            {!allUsed ? (
              <div className="cheat-modal-body">
                {/* Peek */}
                <div className="cheat-card">
                  <div className="cheat-card-icon">👁️</div>
                  <div className="cheat-card-info">
                    <p className="cheat-card-name">{t.cheat.peekName}</p>
                    <p className="cheat-card-desc">{t.cheat.peekDesc}</p>
                    {cheatState.peekCount > 0 && (
                      <p className="cheat-card-used">{t.cheat.usedCount(cheatState.peekCount)}</p>
                    )}
                  </div>
                  <button
                    className="cheat-activate-btn"
                    onClick={onActivatePeek}
                    disabled={remaining <= 0}
                  >
                    {t.cheat.activateBtn}
                  </button>
                </div>

                {/* Oracle */}
                <div className="cheat-card">
                  <div className="cheat-card-icon">🔮</div>
                  <div className="cheat-card-info">
                    <p className="cheat-card-name">{t.cheat.oracleName}</p>
                    <p className="cheat-card-desc">{t.cheat.oracleDesc}</p>
                    {cheatState.oracleCount > 0 && (
                      <p className="cheat-card-used">{t.cheat.usedCount(cheatState.oracleCount)}</p>
                    )}
                  </div>
                  <button
                    className="cheat-activate-btn"
                    onClick={onActivateOracle}
                    disabled={remaining <= 0}
                  >
                    {t.cheat.activateBtn}
                  </button>
                </div>

                {/* Free Move */}
                <div className="cheat-card">
                  <div className="cheat-card-icon">💨</div>
                  <div className="cheat-card-info">
                    <p className="cheat-card-name">{t.cheat.freeMoveName}</p>
                    <p className="cheat-card-desc">{t.cheat.freeMoveDesc}</p>
                    {cheatState.freeMoveCount > 0 && (
                      <p className="cheat-card-used">{t.cheat.usedCount(cheatState.freeMoveCount)}</p>
                    )}
                  </div>
                  <button
                    className="cheat-activate-btn"
                    onClick={onActivateFreeMove}
                    disabled={remaining <= 0}
                  >
                    {t.cheat.activateBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div className="cheat-all-used">
                <p className="cheat-all-used-title">{t.cheat.allUsedTitle}</p>
                <p className="cheat-all-used-desc">{t.cheat.allUsedDesc}</p>
                <button className="cheat-instant-win-btn" onClick={onInstantWin}>
                  {t.cheat.instantWinBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Oracle Card Preview Overlay */}
      {oracleCards !== null && (
        <div className="oracle-overlay" onClick={onDismissOracle}>
          <div className="oracle-content" onClick={e => e.stopPropagation()}>
            <div className="oracle-header">
              <Compass size={20} color="#c084fc" />
              <h3>{t.cheat.oracleTitle}</h3>
            </div>

            {oracleCards.length > 0 ? (
              <div className="oracle-cards-grid">
                {oracleCards.map((card, idx) => (
                  <div key={card.id} className="oracle-card-wrapper">
                    <div className="oracle-card-index">{idx + 1}</div>
                    <div className="card-item face-up" style={{ position: 'relative' }}>
                      <div className={`card-face ${(card.suit === 'hearts' || card.suit === 'diamonds') ? 'red-suit-face' : ''}`}
                        style={{ color: (card.suit === 'hearts' || card.suit === 'diamonds') ? 'var(--card-red)' : 'var(--card-black)' }}
                      >
                        <div className="card-corner top-left">
                          <span className="card-rank">{getRankLabel(card.rank)}</span>
                          <SuitIcon suit={card.suit} className="suit-mini" />
                        </div>
                        <div className="card-center">
                          <SuitIcon suit={card.suit} className="suit-main" />
                        </div>
                        <div className="card-corner bottom-right">
                          <span className="card-rank">{getRankLabel(card.rank)}</span>
                          <SuitIcon suit={card.suit} className="suit-mini" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="oracle-empty-msg">{t.cheat.stockEmpty}</p>
            )}

            <div className="oracle-footer">
              <button className="oracle-dismiss-btn" onClick={onDismissOracle}>
                {t.cheat.oracleDismiss}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

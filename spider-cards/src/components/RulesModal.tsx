import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n';
import './RulesModal.css';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rules-modal-content" onClick={e => e.stopPropagation()}>
        <div className="rules-modal-header">
          <div className="rules-modal-title">
            <HelpCircle className="rules-title-icon" />
            <h2>{t.rules.title}</h2>
          </div>
          <button className="rules-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="rules-modal-body">
          <section className="rules-section">
            <h3>{t.rules.objectiveTitle}</h3>
            <p>{t.rules.objectiveText}</p>
          </section>

          <section className="rules-section">
            <h3>{t.rules.movingCardsTitle}</h3>
            <ul>
              {t.rules.movingCards.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rules-section">
            <h3>{t.rules.stockPileTitle}</h3>
            <ul>
              {t.rules.stockPileItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rules-section">
            <h3>{t.rules.scoringTitle}</h3>
            <ul>
              {t.rules.scoringItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="rules-modal-footer">
          <button className="rules-confirm-btn" onClick={onClose}>{t.rules.closeButton}</button>
        </div>
      </div>
    </div>
  );
};

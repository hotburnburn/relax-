import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import './RulesModal.css';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rules-modal-content" onClick={e => e.stopPropagation()}>
        <div className="rules-modal-header">
          <div className="rules-modal-title">
            <HelpCircle className="rules-title-icon" />
            <h2>Spider Solitaire Rules</h2>
          </div>
          <button className="rules-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="rules-modal-body">
          <section className="rules-section">
            <h3>Objective</h3>
            <p>
              Assemble 8 sequences of cards of the same suit in descending order (King down to Ace) within the tableau columns.
              When a full sequence is formed, it is automatically removed to the Completed Runs area.
              Clear all 104 cards to win!
            </p>
          </section>

          <section className="rules-section">
            <h3>Moving Cards</h3>
            <ul>
              <li>You can move a single card from the bottom of a column to another column if it is <strong>one rank lower</strong> than the card it is placed on (e.g., placing a 4 on a 5). Suit does not matter for single-card movements.</li>
              <li>You can move a <strong>group of cards</strong> together only if they are in descending order <strong>and</strong> are of the <strong>same suit</strong> (e.g., Spades 7-6-5 can be moved together, but Spades 7 - Hearts 6 - Spades 5 cannot).</li>
              <li>Any face-up card or valid same-suit sequence can be moved into an <strong>empty column</strong>.</li>
              <li>Flipped-down cards at the bottom of columns are automatically turned face up when exposed.</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>Stock Pile (Dealing)</h3>
            <ul>
              <li>When you get stuck, click the <strong>Stock Pile</strong> in the top-right to deal one card face up to each of the 10 columns.</li>
              <li><strong>Crucial:</strong> You cannot deal cards from the stock if there are any <strong>empty columns</strong> on the tableau. You must fill all empty spaces first.</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>Scoring</h3>
            <ul>
              <li>You start the game with <strong>500 points</strong>.</li>
              <li>Each card move (or undoing a move) costs <strong>1 point</strong>.</li>
              <li>Each completed King-to-Ace sequence rewards you with <strong>100 points</strong>.</li>
            </ul>
          </section>
        </div>

        <div className="rules-modal-footer">
          <button className="rules-confirm-btn" onClick={onClose}>Got it, let's play!</button>
        </div>
      </div>
    </div>
  );
};

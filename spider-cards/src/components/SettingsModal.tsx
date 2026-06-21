import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { useLanguage } from '../i18n';
import type { Suit } from '../types/game';
import './SettingsModal.css';

export interface GameSettings {
  easySuit: Suit;
  mediumSuits: Suit[];
  maxCheats: number;
  initialScore: number;
  moveCost: number;
  runBonus: number;
  easyMinQuality: number;
  easyMaxAttempts: number;
  mediumMinQuality: number;
  mediumMaxAttempts: number;
  hardMinQuality: number;
  hardMaxAttempts: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (newSettings: GameSettings, shouldRestart: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const { t } = useLanguage();
  const [easySuit, setEasySuit] = useState<Suit>(settings.easySuit);
  const [mediumSuits, setMediumSuits] = useState<Suit[]>(settings.mediumSuits);
  const [maxCheats, setMaxCheats] = useState<number>(settings.maxCheats);
  const [initialScore, setInitialScore] = useState<number>(settings.initialScore);
  const [moveCost, setMoveCost] = useState<number>(settings.moveCost);
  const [runBonus, setRunBonus] = useState<number>(settings.runBonus);

  // New Deal quality parameters
  const [easyMinQuality, setEasyMinQuality] = useState<number>(settings.easyMinQuality ?? 20);
  const [easyMaxAttempts, setEasyMaxAttempts] = useState<number>(settings.easyMaxAttempts ?? 100);
  const [mediumMinQuality, setMediumMinQuality] = useState<number>(settings.mediumMinQuality ?? 14);
  const [mediumMaxAttempts, setMediumMaxAttempts] = useState<number>(settings.mediumMaxAttempts ?? 60);
  const [hardMinQuality, setHardMinQuality] = useState<number>(settings.hardMinQuality ?? 8);
  const [hardMaxAttempts, setHardMaxAttempts] = useState<number>(settings.hardMaxAttempts ?? 30);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setEasySuit(settings.easySuit);
      setMediumSuits(settings.mediumSuits);
      setMaxCheats(settings.maxCheats);
      setInitialScore(settings.initialScore);
      setMoveCost(settings.moveCost);
      setRunBonus(settings.runBonus);

      setEasyMinQuality(settings.easyMinQuality ?? 20);
      setEasyMaxAttempts(settings.easyMaxAttempts ?? 100);
      setMediumMinQuality(settings.mediumMinQuality ?? 14);
      setMediumMaxAttempts(settings.mediumMaxAttempts ?? 60);
      setHardMinQuality(settings.hardMinQuality ?? 8);
      setHardMaxAttempts(settings.hardMaxAttempts ?? 30);

      setErrorMsg(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const suitsList: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

  const handleMediumSuitToggle = (suit: Suit) => {
    setMediumSuits((prev) => {
      if (prev.includes(suit)) {
        return prev.filter((s) => s !== suit);
      } else {
        return [...prev, suit];
      }
    });
  };

  const handleSave = (shouldRestart: boolean) => {
    // Validate Medium suits: must be exactly 2
    if (mediumSuits.length !== 2) {
      setErrorMsg(t.settings.mediumSuitsWarning);
      return;
    }

    onSave(
      {
        easySuit,
        mediumSuits,
        maxCheats,
        initialScore,
        moveCost,
        runBonus,
        easyMinQuality,
        easyMaxAttempts,
        mediumMinQuality,
        mediumMaxAttempts,
        hardMinQuality,
        hardMaxAttempts,
      },
      shouldRestart
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div className="settings-modal-title">
            <Settings className="settings-title-icon" />
            <h2>{t.settings.title}</h2>
          </div>
          <button className="settings-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="settings-modal-body">
          {errorMsg && <div className="settings-error-alert">{errorMsg}</div>}

          {/* Easy Suit Selection */}
          <div className="settings-group">
            <label className="settings-label">{t.settings.easySuitLabel}</label>
            <div className="settings-options-grid">
              {suitsList.map((suit) => (
                <button
                  key={suit}
                  type="button"
                  className={`settings-suit-btn ${easySuit === suit ? 'active' : ''} ${suit}`}
                  onClick={() => setEasySuit(suit)}
                >
                  {suit === 'spades' && t.settings.suitSpades}
                  {suit === 'hearts' && t.settings.suitHearts}
                  {suit === 'diamonds' && t.settings.suitDiamonds}
                  {suit === 'clubs' && t.settings.suitClubs}
                </button>
              ))}
            </div>
          </div>

          {/* Medium Suit Selection */}
          <div className="settings-group">
            <label className="settings-label">{t.settings.mediumSuitsLabel}</label>
            <div className="settings-options-grid">
              {suitsList.map((suit) => {
                const isActive = mediumSuits.includes(suit);
                return (
                  <button
                    key={suit}
                    type="button"
                    className={`settings-suit-btn ${isActive ? 'active' : ''} ${suit}`}
                    onClick={() => handleMediumSuitToggle(suit)}
                  >
                    {suit === 'spades' && t.settings.suitSpades}
                    {suit === 'hearts' && t.settings.suitHearts}
                    {suit === 'diamonds' && t.settings.suitDiamonds}
                    {suit === 'clubs' && t.settings.suitClubs}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-divider" />

          {/* Cheat and Score settings row */}
          <div className="settings-sliders-grid">
            <div className="slider-item">
              <label className="settings-label">
                {t.settings.maxCheatsLabel} <span className="slider-val">{maxCheats}</span>
              </label>
              <input
                type="range"
                min="0"
                max="99"
                value={maxCheats}
                onChange={(e) => setMaxCheats(parseInt(e.target.value))}
                className="settings-slider"
              />
              <span className="slider-desc">{t.settings.maxCheatsDesc}</span>
            </div>

            <div className="slider-item">
              <label className="settings-label">
                {t.settings.initialScoreLabel} <span className="slider-val">{initialScore}</span>
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={initialScore}
                onChange={(e) => setInitialScore(parseInt(e.target.value))}
                className="settings-slider"
              />
            </div>

            <div className="slider-item">
              <label className="settings-label">
                {t.settings.moveCostLabel} <span className="slider-val">{moveCost}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={moveCost}
                onChange={(e) => setMoveCost(parseInt(e.target.value))}
                className="settings-slider"
              />
            </div>

            <div className="slider-item">
              <label className="settings-label">
                {t.settings.runBonusLabel} <span className="slider-val">{runBonus}</span>
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={runBonus}
                onChange={(e) => setRunBonus(parseInt(e.target.value))}
                className="settings-slider"
              />
            </div>
          </div>

          <div className="settings-divider" />

          {/* Deal quality config */}
          <div className="settings-group">
            <label className="settings-label">{t.settings.dealQualityGroupTitle}</label>
            <div className="settings-deal-quality-grid">
              {/* Easy */}
              <div className="deal-quality-section">
                <span className="deal-quality-section-title">{t.settings.dealQualityEasyLabel}</span>
                <div className="slider-item">
                  <label className="settings-label sub-label">
                    {t.settings.qualityThresholdLabel} <span className="slider-val">{easyMinQuality}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={easyMinQuality}
                    onChange={(e) => setEasyMinQuality(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>
                <div className="slider-item">
                  <label className="settings-label sub-label">
                    {t.settings.attemptsLabel} <span className="slider-val">{easyMaxAttempts}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="300"
                    value={easyMaxAttempts}
                    onChange={(e) => setEasyMaxAttempts(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="deal-quality-section">
                <span className="deal-quality-section-title">{t.settings.dealQualityMediumLabel}</span>
                <div className="slider-item">
                  <label className="settings-label sub-label">
                    {t.settings.qualityThresholdLabel} <span className="slider-val">{mediumMinQuality}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={mediumMinQuality}
                    onChange={(e) => setMediumMinQuality(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>
                <div className="slider-item">
                  <label className="settings-label sub-label">
                    {t.settings.attemptsLabel} <span className="slider-val">{mediumMaxAttempts}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={mediumMaxAttempts}
                    onChange={(e) => setMediumMaxAttempts(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="deal-quality-section">
                <span className="deal-quality-section-title">{t.settings.dealQualityHardLabel}</span>
                <div className="slider-item">
                  <label className="settings-label sub-label">
                    {t.settings.qualityThresholdLabel} <span className="slider-val">{hardMinQuality}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={hardMinQuality}
                    onChange={(e) => setHardMinQuality(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>
                <div className="slider-item">
                  <label className="settings-label sub-label">
                    {t.settings.attemptsLabel} <span className="slider-val">{hardMaxAttempts}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={hardMaxAttempts}
                    onChange={(e) => setHardMaxAttempts(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="settings-restart-notice">{t.settings.restartNotice}</p>
        </div>

        <div className="settings-modal-footer">
          <button className="settings-save-btn secondary" onClick={() => handleSave(false)}>
            {t.settings.saveBtn}
          </button>
          <button className="settings-save-btn primary" onClick={() => handleSave(true)}>
            {t.settings.saveAndRestartBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

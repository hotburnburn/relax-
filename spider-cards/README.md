# 🕷️ Spider Solitaire / 蜘蛛纸牌

A polished Spider Solitaire game built with React + TypeScript + Vite.

## Features

- 🎴 Three difficulty levels — 1 suit (Easy), 2 suits (Medium), 4 suits (Hard)
- 🔊 Sound effects with mute toggle
- ↩️ Undo / Redo support
- 💡 Hint system with weighted move suggestions
- 🖱️ Click-to-move & drag-and-drop
- 🌐 Bilingual UI (中文 / English)
- 💾 Auto-save to localStorage
- ⌨️ Keyboard shortcuts (`Ctrl+Z` Undo, `Ctrl+Y` Redo, `H` Hint, `N` New Game)
- 🔮 **Cheat System (作弊系统)** — Includes Peek, Oracle, Free Move, and Instant Win
- ⚙️ **Advanced Settings (高级设置)** — Customize suit choices, cheat limits, scoring values, and shuffle quality thresholds

## Cheat System

Accessible via the sparkles button (✨) in the bottom-left, the cheat system provides a total budget of uses per game (default 10) to help you get through tough spots:

1. 👁️ **Peek (偷看)** — Temporarily flips up any face-down card for 2 seconds. Costs 1 use.
2. 🔮 **Oracle (先知)** — Previews the next 10 cards to be dealt from the stock pile. Costs 1 use.
3. 💨 **Free Move (自由移动)** — Bypasses all validation rules for your next card drag/move (allowing placing any card on top of any other column). Costs 1 use.
4. 💥 **One-Click Win (一键通关)** — Automatically unlocked after all cheat budget uses are exhausted. Triggers the victory screen instantly.

*Note: All cheat states are isolated from undo/redo history to prevent rewinding cheats.*

## Advanced Settings

Accessible via the gear icon (⚙️) in the header. Options are persisted in `localStorage` and include:

- **Custom Suit Distribution**:
  - Customize the single suit to play with in Easy mode (Spades, Hearts, Diamonds, or Clubs).
  - Customize the exact 2 suits to play with in Medium mode.
- **Cheat Budget**:
  - Manually configure the maximum cheat count allowed per game (from 0 to 99 uses).
- **Scoring Customization**:
  - Adjust the initial score (default 500, range 100-2000).
  - Adjust points deducted per move (default 1, range 0-10).
  - Adjust points awarded per completed run (default 100, range 10-500).
- **Quantitative Shuffle Filtering (Quantitative Difficulty Tuning)**:
  - Manually tune the shuffle filter parameters (**Min Quality Score** and **Max Shuffle Attempts**) for Easy, Medium, and Hard modes to fine-tune the game's actual deal quality and difficulty to your exact preference.

## Getting Started

```bash
npm install
npm run dev
```

## Deal Quality Optimization

The game does **not** use purely random shuffles. Instead, it employs a **"best-of-N" selection** strategy combined with a multi-dimensional quality scoring system to ensure every game starts with a playable — but still challenging — opening.

### How It Works

1. **Multiple shuffles** — The engine shuffles the deck multiple times and evaluates each deal.
2. **Quality scoring** — Each deal is scored across 6 dimensions (see below).
3. **Best pick** — The highest-scoring deal is selected, or the first deal that meets the quality threshold.
4. **Easy-mode bonus** — For 1-suit games, an additional improvement pass swaps up to 4 hidden cards with stock cards to create better reveal sequences.

### Difficulty Tuning

| Difficulty | Max Shuffle Attempts | Quality Threshold |
|:----------:|:--------------------:|:-----------------:|
| Easy (1♠)  | 100                  | 20                |
| Medium (2♠♥) | 60                | 14                |
| Hard (4♠♥♦♣) | 30                | 8                 |

### Scoring Dimensions

| # | Dimension | Rule | Score |
|:-:|-----------|------|:-----:|
| 1 | **Same-suit initial move** | A face-up card can be placed on another face-up card of the same suit with rank + 1 | **+4** per move |
| 2 | **Cross-suit initial move** | Same as above but different suit | **+1** per move |
| 3 | **Rank diversity** | Number of distinct ranks among the 10 face-up cards | **+1** per unique rank |
| 4 | **Hidden sequence potential** | The card just below a face-up card has rank + 1 (same suit: +3, different suit: +1) | **+3** or **+1** |
| 5 | **Same-rank clustering penalty** | 3+ face-up cards share the same rank | **−3** (3 cards) / **−8** (4+ cards) |
| 6 | **King penalty** | Kings in face-up position can't be placed on anything | **−2** per King |
| 7 | **Ace penalty** (Easy only) | Aces in face-up position — nothing can be placed on them | **−1** per Ace |

### Easy-Mode Improvement Pass

After selecting the best deal, the engine scans each column's hidden layer. If the card directly below the face-up card does **not** form a same-suit descending sequence, it attempts to find a matching card in the stock pile and swaps them. This is capped at **4 swaps** to keep the game feeling natural rather than rigged.

### Design Philosophy

- **Easy should feel easy** — Players new to Spider Solitaire should be able to make meaningful progress and learn the mechanics without hitting dead ends on turn one.
- **Hard should stay hard** — Fewer optimization attempts and a lower quality bar preserve the authentic challenge of 4-suit Spider.
- **Never feel rigged** — The optimization only influences the *initial deal quality*; it doesn't pre-solve the game or guarantee a win. The player still needs skill and strategy.
- **Zero performance cost** — Even 100 shuffles of a 104-card deck complete in under 10ms on modern hardware.

## Tech Stack

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)

## License

MIT

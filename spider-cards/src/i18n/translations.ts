export interface Translations {
  // Header
  header: {
    title: string;
    undoTooltip: string;
    undoLabel: string;
    redoTooltip: string;
    redoLabel: string;
    hintTooltip: string;
    hintLabel: string;
    unmuteTooltip: string;
    muteTooltip: string;
    rulesTooltip: string;
    restartTooltip: string;
    difficultyLabel: string;
    difficultyEasy: string;
    difficultyMedium: string;
    difficultyHard: string;
    scoreLabel: string;
    movesLabel: string;
    timeLabel: string;
  };

  // RulesModal
  rules: {
    title: string;
    objectiveTitle: string;
    objectiveText: string;
    movingCardsTitle: string;
    movingCards: string[];
    stockPileTitle: string;
    stockPileItems: string[];
    scoringTitle: string;
    scoringItems: string[];
    closeButton: string;
  };

  // VictoryModal
  victory: {
    title: string;
    subtitle: string;
    difficultyLabel: string;
    difficultyEasy: string;
    difficultyMedium: string;
    difficultyHard: string;
    finalScoreLabel: string;
    totalMovesLabel: string;
    timeTakenLabel: string;
    playAgainButton: string;
  };

  // StockPile
  stockPile: {
    noCardsTooltip: string;
    fillColumnsTooltip: string;
    dealTooltip: (remaining: number) => string;
    title: string;
    dealsCount: (count: number) => string;
    emptyColumnsWarning: string;
  };

  // Foundations
  foundations: {
    title: string;
  };

  // App (alerts/confirms)
  app: {
    confirmRestart: string;
    alertEmptyColumns: string;
    alertNoMoves: string;
  };
}

const en: Translations = {
  header: {
    title: 'Spider Cards',
    undoTooltip: 'Undo Move (Ctrl+Z)',
    undoLabel: 'Undo',
    redoTooltip: 'Redo Move (Ctrl+Y)',
    redoLabel: 'Redo',
    hintTooltip: 'Get a Hint (H)',
    hintLabel: 'Hint',
    unmuteTooltip: 'Unmute sounds',
    muteTooltip: 'Mute sounds',
    rulesTooltip: 'Game Rules',
    restartTooltip: 'Restart Game',
    difficultyLabel: 'Difficulty:',
    difficultyEasy: 'Easy (1 Suit - ♠)',
    difficultyMedium: 'Medium (2 Suits - ♠ ♥)',
    difficultyHard: 'Hard (4 Suits - ♠ ♥ ♦ ♣)',
    scoreLabel: 'Score',
    movesLabel: 'Moves',
    timeLabel: 'Time',
  },

  rules: {
    title: 'Spider Solitaire Rules',
    objectiveTitle: 'Objective',
    objectiveText:
      'Build 8 sequences of cards in suit from King down to Ace. When a complete sequence is formed, it is automatically removed to the foundation. Clear all cards from the table to win!',
    movingCardsTitle: 'Moving Cards',
    movingCards: [
      'You can move a card or a group of cards from one column to another if the card being moved is one rank lower than the card it is placed on.',
      'Only groups of cards that are in the same suit and in descending order can be moved together.',
      'Any card or valid group can be moved to an empty column.',
      'When a complete sequence from King to Ace of the same suit is formed, it is automatically moved to the foundation.',
    ],
    stockPileTitle: 'Stock Pile (Dealing)',
    stockPileItems: [
      'Click the stock pile to deal one card to each of the 10 columns.',
      'You cannot deal from the stock pile if any column is empty — fill all empty columns first.',
    ],
    scoringTitle: 'Scoring',
    scoringItems: [
      'You start with 500 points.',
      'Each move deducts 1 point.',
      'Completing a full suit sequence (King to Ace) awards 100 points.',
    ],
    closeButton: "Got it, let's play!",
  },

  victory: {
    title: 'Victory!',
    subtitle: 'You have successfully cleared all 8 runs!',
    difficultyLabel: 'Difficulty',
    difficultyEasy: 'Easy (1 Suit)',
    difficultyMedium: 'Medium (2 Suits)',
    difficultyHard: 'Hard (4 Suits)',
    finalScoreLabel: 'Final Score',
    totalMovesLabel: 'Total Moves',
    timeTakenLabel: 'Time Taken',
    playAgainButton: 'Play Another Round',
  },

  stockPile: {
    noCardsTooltip: 'No cards left in stock',
    fillColumnsTooltip: 'Fill all empty columns before dealing',
    dealTooltip: (remaining: number) =>
      `Click to deal 10 cards (${remaining} remaining)`,
    title: 'Stock',
    dealsCount: (count: number) => `(${count} deals)`,
    emptyColumnsWarning: 'Empty columns exist!',
  },

  foundations: {
    title: 'Completed Runs',
  },

  app: {
    confirmRestart:
      'Are you sure you want to start a new game? Your current progress will be lost.',
    alertEmptyColumns:
      'You cannot deal cards when there are empty columns on the board. Fill them first!',
    alertNoMoves: 'No valid moves available. Deal from stock!',
  },
};

const zh: Translations = {
  header: {
    title: '蜘蛛纸牌',
    undoTooltip: '撤销 (Ctrl+Z)',
    undoLabel: '撤销',
    redoTooltip: '重做 (Ctrl+Y)',
    redoLabel: '重做',
    hintTooltip: '提示 (H)',
    hintLabel: '提示',
    unmuteTooltip: '开启音效',
    muteTooltip: '关闭音效',
    rulesTooltip: '游戏规则',
    restartTooltip: '重新开始',
    difficultyLabel: '难度：',
    difficultyEasy: '简单 (1花色 - ♠)',
    difficultyMedium: '中等 (2花色 - ♠ ♥)',
    difficultyHard: '困难 (4花色 - ♠ ♥ ♦ ♣)',
    scoreLabel: '得分',
    movesLabel: '步数',
    timeLabel: '时间',
  },

  rules: {
    title: '蜘蛛纸牌规则',
    objectiveTitle: '游戏目标',
    objectiveText:
      '将牌组成8组从K到A的同花色降序序列。每完成一组序列，该组牌会自动移至完成区。清除桌面上所有的牌即可获胜！',
    movingCardsTitle: '移牌规则',
    movingCards: [
      '可以将一张牌或一组牌从一列移到另一列，前提是被移动的牌比目标位置的牌小一级。',
      '只有同花色且按降序排列的牌组才能一起移动。',
      '任何牌或有效牌组都可以移到空列上。',
      '当同花色从K到A的完整序列形成时，会自动移至完成区。',
    ],
    stockPileTitle: '发牌堆',
    stockPileItems: [
      '点击发牌堆可向10列各发一张牌。',
      '如果有空列，则不能从发牌堆发牌——需先填满所有空列。',
    ],
    scoringTitle: '计分规则',
    scoringItems: [
      '初始分数为500分。',
      '每移动一步扣1分。',
      '完成一组完整的同花色序列（K到A）奖励100分。',
    ],
    closeButton: '知道了，开始游戏！',
  },

  victory: {
    title: '恭喜通关！',
    subtitle: '你已成功完成全部8组序列！',
    difficultyLabel: '难度',
    difficultyEasy: '简单 (1花色)',
    difficultyMedium: '中等 (2花色)',
    difficultyHard: '困难 (4花色)',
    finalScoreLabel: '最终得分',
    totalMovesLabel: '总步数',
    timeTakenLabel: '用时',
    playAgainButton: '再来一局',
  },

  stockPile: {
    noCardsTooltip: '发牌堆已空',
    fillColumnsTooltip: '请先填满所有空列再发牌',
    dealTooltip: (remaining: number) =>
      `点击发牌，每列一张（剩余 ${remaining} 张）`,
    title: '发牌堆',
    dealsCount: (count: number) => `(${count} 次)`,
    emptyColumnsWarning: '存在空列！',
  },

  foundations: {
    title: '已完成序列',
  },

  app: {
    confirmRestart: '确定要重新开始吗？当前游戏进度将会丢失。',
    alertEmptyColumns: '存在空列时无法发牌，请先填满所有空列！',
    alertNoMoves: '没有可用的移动了，请从发牌堆发牌！',
  },
};

export const translations: Record<string, Translations> = { en, zh };

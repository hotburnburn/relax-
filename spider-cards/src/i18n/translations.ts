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

  // Cheat Panel
  cheat: {
    panelTitle: string;
    remaining: (used: number, max: number) => string;
    peekName: string;
    peekDesc: string;
    oracleName: string;
    oracleDesc: string;
    freeMoveName: string;
    freeMoveDesc: string;
    activateBtn: string;
    usedCount: (count: number) => string;
    allUsedTitle: string;
    allUsedDesc: string;
    instantWinBtn: string;
    stockEmpty: string;
    peekModeActive: string;
    freeMoveModeActive: string;
    oracleTitle: string;
    oracleDismiss: string;
  };

  // Settings Panel
  settings: {
    title: string;
    easySuitLabel: string;
    mediumSuitsLabel: string;
    mediumSuitsWarning: string;
    maxCheatsLabel: string;
    maxCheatsDesc: string;
    initialScoreLabel: string;
    moveCostLabel: string;
    runBonusLabel: string;
    restartNotice: string;
    saveBtn: string;
    saveAndRestartBtn: string;
    suitSpades: string;
    suitHearts: string;
    suitDiamonds: string;
    suitClubs: string;
    dealQualityGroupTitle: string;
    dealQualityEasyLabel: string;
    dealQualityMediumLabel: string;
    dealQualityHardLabel: string;
    attemptsLabel: string;
    qualityThresholdLabel: string;
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

  cheat: {
    panelTitle: 'Cheat Panel',
    remaining: (used: number, max: number) => `${max - used} cheats remaining`,
    peekName: 'Peek',
    peekDesc: 'Click any face-down card to peek at it for 2 seconds',
    oracleName: 'Oracle',
    oracleDesc: 'Preview the next 10 cards to be dealt from the stock',
    freeMoveName: 'Free Move',
    freeMoveDesc: 'Your next move can ignore suit and rank rules',
    activateBtn: 'Activate',
    usedCount: (count: number) => `Used ${count} time${count !== 1 ? 's' : ''}`,
    allUsedTitle: 'All cheats used up!',
    allUsedDesc: `Since you've used all your cheats... why not just...`,
    instantWinBtn: '💥 Instant Win',
    stockEmpty: 'Stock pile is empty!',
    peekModeActive: 'Peek Mode — Click any face-down card',
    freeMoveModeActive: 'Free Move — Next move ignores rules',
    oracleTitle: 'Next 10 Cards',
    oracleDismiss: 'Got it',
  },

  settings: {
    title: 'Advanced Settings',
    easySuitLabel: 'Easy Difficulty Suit:',
    mediumSuitsLabel: 'Medium Difficulty Suits (Select exactly 2):',
    mediumSuitsWarning: 'Please select exactly 2 suits for Medium mode.',
    maxCheatsLabel: 'Cheats Budget per Game:',
    maxCheatsDesc: 'How many times you can cheat in a game',
    initialScoreLabel: 'Initial Score:',
    moveCostLabel: 'Points Cost per Move:',
    runBonusLabel: 'Completed Run Bonus:',
    restartNotice: '⚠️ Note: Suit and scoring changes will apply to the next game or after a restart.',
    saveBtn: 'Save & Continue',
    saveAndRestartBtn: 'Save & Restart Game',
    suitSpades: 'Spades ♠',
    suitHearts: 'Hearts ♥',
    suitDiamonds: 'Diamonds ♦',
    suitClubs: 'Clubs ♣',
    dealQualityGroupTitle: 'Deal Quality / Shuffle Filter Settings',
    dealQualityEasyLabel: 'Easy Difficulty Filtering:',
    dealQualityMediumLabel: 'Medium Difficulty Filtering:',
    dealQualityHardLabel: 'Hard Difficulty Filtering:',
    attemptsLabel: 'Max Shuffle Attempts',
    qualityThresholdLabel: 'Min Quality Score',
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

  cheat: {
    panelTitle: '作弊面板',
    remaining: (used: number, max: number) => `剩余 ${max - used} 次`,
    peekName: '偷看',
    peekDesc: '点击任意暗牌，短暂查看其花色和点数（2秒）',
    oracleName: '先知',
    oracleDesc: '预览牌堆即将发出的10张牌',
    freeMoveName: '自由移动',
    freeMoveDesc: '下一次移动无视花色和点数规则',
    activateBtn: '激活',
    usedCount: (count: number) => `已使用 ${count} 次`,
    allUsedTitle: '作弊次数已用完！',
    allUsedDesc: '既然都用完了…不如直接…',
    instantWinBtn: '💥 一键通关',
    stockEmpty: '牌堆已空！',
    peekModeActive: '偷看模式 — 点击任意暗牌查看',
    freeMoveModeActive: '自由移动 — 下一步无视规则',
    oracleTitle: '接下来的10张牌',
    oracleDismiss: '知道了',
  },

  settings: {
    title: '高级设置',
    easySuitLabel: '简单难度花色选择：',
    mediumSuitsLabel: '中等难度花色选择（请精确选择2种）：',
    mediumSuitsWarning: '中等难度必须且只能选择 2 种花色。',
    maxCheatsLabel: '每局作弊次数限制：',
    maxCheatsDesc: '允许主动使用作弊手段的次数',
    initialScoreLabel: '游戏初始得分：',
    moveCostLabel: '每移动一步扣减分数：',
    runBonusLabel: '完成一组序列奖励分数：',
    restartNotice: '⚠️ 提示：花色和评分系统的改动将在下一局或重新开始后生效。',
    saveBtn: '保存并继续',
    saveAndRestartBtn: '保存并重新开始',
    suitSpades: '黑桃 ♠',
    suitHearts: '红心 ♥',
    suitDiamonds: '方块 ♦',
    suitClubs: '梅花 ♣',
    dealQualityGroupTitle: '发牌质量评分与难度过滤',
    dealQualityEasyLabel: '简单难度过滤：',
    dealQualityMediumLabel: '中等难度过滤：',
    dealQualityHardLabel: '困难难度过滤：',
    attemptsLabel: '最大发牌尝试次数',
    qualityThresholdLabel: '最低发牌质量分',
  },
};

export const translations: Record<string, Translations> = { en, zh };

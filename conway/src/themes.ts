export interface Theme {
  id: string;
  name: string;
  className: string;
  canvas: {
    bg: string;
    cellAlive: string; // Color of mature cells
    cellBorn: string;  // Color of newborn cells
    cellTrail: string; // Color of dead trails
    gridLine: string;  // Color of grid boundaries
  };
  css: {
    bgApp: string;
    bgCard: string;
    border: string;
    accent: string;
    accentGlow: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'cyberpunk',
    name: '赛博霓虹 (Cyberpunk)',
    className: 'theme-cyberpunk',
    canvas: {
      bg: '#0a0b10',
      cellAlive: '#ff007f', // Hot Pink
      cellBorn: '#00f3ff',  // Neon Cyan
      cellTrail: 'rgba(0, 243, 255, 0.12)', // Trail glow
      gridLine: 'rgba(255, 255, 255, 0.025)'
    },
    css: {
      bgApp: '#0a0b10',
      bgCard: '#12131f',
      border: 'rgba(255, 0, 127, 0.25)',
      accent: '#00f3ff',
      accentGlow: 'rgba(0, 243, 255, 0.5)',
      textPrimary: '#f5f5fa',
      textSecondary: '#94a3b8'
    }
  },
  {
    id: 'matrix',
    name: '绿幕客 (Matrix Retro)',
    className: 'theme-matrix',
    canvas: {
      bg: '#020202',
      cellAlive: '#00cc00', // Classic terminal green
      cellBorn: '#39ff14',  // Glowing green
      cellTrail: 'rgba(0, 255, 0, 0.1)',
      gridLine: 'rgba(57, 255, 20, 0.04)'
    },
    css: {
      bgApp: '#020202',
      bgCard: '#090a09',
      border: 'rgba(0, 255, 0, 0.3)',
      accent: '#39ff14',
      accentGlow: 'rgba(57, 255, 20, 0.6)',
      textPrimary: '#39ff14',
      textSecondary: '#009900'
    }
  },
  {
    id: 'glass',
    name: '炫光玻态 (Glassmorphism)',
    className: 'theme-glass',
    canvas: {
      bg: '#080c14',
      cellAlive: '#8b5cf6', // Violet
      cellBorn: '#38bdf8',  // Sky Blue
      cellTrail: 'rgba(56, 189, 248, 0.15)',
      gridLine: 'rgba(255, 255, 255, 0.03)'
    },
    css: {
      bgApp: '#080c14',
      bgCard: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#6366f1',
      accentGlow: 'rgba(99, 102, 241, 0.4)',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1'
    }
  },
  {
    id: 'classic',
    name: '极简明朗 (Classic Stark)',
    className: 'theme-classic',
    canvas: {
      bg: '#ffffff',
      cellAlive: '#1e293b', // Slate 800
      cellBorn: '#475569',  // Slate 600
      cellTrail: 'rgba(71, 85, 105, 0.06)',
      gridLine: '#e2e8f0'   // Slate 200
    },
    css: {
      bgApp: '#f8fafc',
      bgCard: '#ffffff',
      border: '#cbd5e1',
      accent: '#0f172a',
      accentGlow: 'rgba(15, 23, 42, 0.2)',
      textPrimary: '#0f172a',
      textSecondary: '#64748b'
    }
  }
];

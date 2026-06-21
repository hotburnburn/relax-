import type { Preset } from './types';

export const PRESETS: Preset[] = [
  // --- OSCILLATORS ---
  {
    name: 'Blinker',
    description: 'The simplest oscillator. Period 2.',
    category: 'Oscillators',
    width: 3,
    height: 3,
    cells: [
      [0, -1],
      [0, 0],
      [0, 1]
    ]
  },
  {
    name: 'Toad',
    description: 'A period-2 oscillator resembling a toad.',
    category: 'Oscillators',
    width: 4,
    height: 4,
    cells: [
      [0, 0], [0, 1], [0, 2],
      [1, -1], [1, 0], [1, 1]
    ]
  },
  {
    name: 'Beacon',
    description: 'A period-2 oscillator composed of two blocks.',
    category: 'Oscillators',
    width: 4,
    height: 4,
    cells: [
      [-1, -1], [-1, 0],
      [0, -1],
      [1, 2],
      [2, 1], [2, 2]
    ]
  },
  {
    name: 'Pulsar',
    description: 'A large, beautiful period-3 oscillator resembling a blooming star.',
    category: 'Oscillators',
    width: 15,
    height: 15,
    cells: [
      // Top left quadrant outer ring/bars
      [-6, -2], [-6, -3], [-6, -4],
      [-1, -2], [-1, -3], [-1, -4],
      [-2, -6], [-3, -6], [-4, -6],
      [-2, -1], [-3, -1], [-4, -1],

      // Top right quadrant
      [-6, 2], [-6, 3], [-6, 4],
      [-1, 2], [-1, 3], [-1, 4],
      [-2, 6], [-3, 6], [-4, 6],
      [-2, 1], [-3, 1], [-4, 1],

      // Bottom left quadrant
      [6, -2], [6, -3], [6, -4],
      [1, -2], [1, -3], [1, -4],
      [2, -6], [3, -6], [4, -6],
      [2, -1], [3, -1], [4, -1],

      // Bottom right quadrant
      [6, 2], [6, 3], [6, 4],
      [1, 2], [1, 3], [1, 4],
      [2, 6], [3, 6], [4, 6],
      [2, 1], [3, 1], [4, 1]
    ]
  },
  {
    name: 'Pentadecathlon',
    description: 'A period-15 oscillator.',
    category: 'Oscillators',
    width: 10,
    height: 3,
    cells: [
      [0, -4], [0, -3],
      [1, -2], [-1, -2],
      [0, -1], [0, 0], [0, 1], [0, 2],
      [1, 3], [-1, 3],
      [0, 4], [0, 5]
    ]
  },

  // --- SPACESHIPS ---
  {
    name: 'Glider',
    description: 'The smallest and most famous spaceship. Moves diagonally.',
    category: 'Spaceships',
    width: 3,
    height: 3,
    cells: [
      [-1, 0],
      [0, 1],
      [1, -1], [1, 0], [1, 1]
    ]
  },
  {
    name: 'LWSS (Light Spaceship)',
    description: 'A lightweight spaceship that travels orthogonally.',
    category: 'Spaceships',
    width: 5,
    height: 4,
    cells: [
      [-1, -1], [-1, 2],
      [0, -2],
      [1, -2], [1, 2],
      [2, -2], [2, -1], [2, 0], [2, 1]
    ]
  },
  {
    name: 'HWSS (Heavy Spaceship)',
    description: 'A heavyweight spaceship that travels orthogonally.',
    category: 'Spaceships',
    width: 7,
    height: 5,
    cells: [
      [-2, 0], [-2, 1],
      [-1, -2], [-1, 3],
      [0, -3],
      [1, -3], [1, 3],
      [2, -3], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2]
    ]
  },

  // --- GUNS ---
  {
    name: 'Gosper Glider Gun',
    description: 'The first known gun. Creates an infinite stream of gliders.',
    category: 'Guns',
    width: 36,
    height: 9,
    cells: [
      // Left block
      [0, -18], [0, -17],
      [1, -18], [1, -17],

      // Left engine
      [0, -8], [0, -7],
      [1, -9], [1, -7],
      [2, -9], [2, -8],

      // Middle bullet
      [0, 4], [0, 5],
      [-1, 4], [-1, 6],
      [-2, 5], [-2, 6],

      // Right engine
      [-4, -3], [-4, -4],
      [-3, -5], [-3, -3],
      [-2, -5], [-2, -4],

      // Middle block
      [-2, 17], [-2, 18],
      [-3, 17], [-3, 18],

      // Space shuttle / trigger details
      [8, 2], [8, 3], [8, 4],
      [9, 2],
      [10, 3]
    ]
  },

  // --- METHUSELAHS ---
  {
    name: 'R-pentomino',
    description: 'A tiny 5-cell pattern that stabilizes after 1103 generations.',
    category: 'Methuselahs',
    width: 3,
    height: 3,
    cells: [
      [-1, 0], [-1, 1],
      [0, -1], [0, 0],
      [1, 0]
    ]
  },
  {
    name: 'Diehard',
    description: 'Disappears completely after 130 generations.',
    category: 'Methuselahs',
    width: 8,
    height: 3,
    cells: [
      [0, -3], [0, -2],
      [1, -2],
      [1, 3], [1, 4], [1, 5],
      [-1, 4]
    ]
  },
  {
    name: 'Acorn',
    description: 'Stabilizes into a huge structure after 5206 generations.',
    category: 'Methuselahs',
    width: 7,
    height: 3,
    cells: [
      [-1, -2],
      [0, 0],
      [1, -3], [1, -2], [1, 1], [1, 2], [1, 3]
    ]
  }
];

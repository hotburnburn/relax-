export type Point = [number, number];

export interface CellState {
  alive: boolean;
  age: number;
  trail: number; // 0 to 1 value for decay trails
}

export type GridType = CellState[][];

export interface Preset {
  name: string;
  description: string;
  cells: Point[]; // Relative offsets from center/spawn point
  width: number;
  height: number;
  category: 'Oscillators' | 'Spaceships' | 'Guns' | 'Methuselahs' | 'Others';
}

export interface GameRules {
  born: number[]; // Numbers of neighbors needed to become alive
  survive: number[]; // Numbers of neighbors needed to stay alive
}

export type DrawMode = 'draw' | 'erase' | 'preset';

export interface SimulationStats {
  generation: number;
  population: number;
  peakPopulation: number;
  gridDensity: number; // Percentage of alive cells
  history: number[]; // Population history for the chart
}

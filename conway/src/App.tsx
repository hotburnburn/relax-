import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, SkipForward, Sparkles, Trash2, 
  Volume2, VolumeX, Eye, EyeOff, Info,
  MousePointer, Eraser, Stamp, Zap
} from 'lucide-react';
import type { GridType, Preset, GameRules, DrawMode, SimulationStats } from './types';
import { PRESETS } from './presets';
import { THEMES, type Theme } from './themes';
import { audioSynth } from './audio';

const DEFAULT_ROWS = 50;
const DEFAULT_COLS = 80;
const CELL_SIZE = 12; // Base cell dimension in pixels

const STANDARD_RULES = [
  { name: '康威生命游戏 (Conway B3/S23)', born: [3], survive: [2, 3] },
  { name: '复制器 (Replicator B1357/S1357)', born: [1, 3, 5, 7], survive: [1, 3, 5, 7] },
  { name: '高阶生命 (HighLife B36/S23)', born: [3, 6], survive: [2, 3] },
  { name: '种子生息 (Seeds B2/S)', born: [2], survive: [] },
  { name: '迷宫创造 (Maze B3/S12345)', born: [3], survive: [1, 2, 3, 4, 5] },
  { name: '白昼与黑夜 (Day & Night B3678/S34678)', born: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
  { name: '无死之域 (Life Without Death B3/S012345678)', born: [3], survive: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
];

export default function App() {
  // Theme & Sound Settings
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [isMuted, setIsMuted] = useState(true);

  // Simulation parameters
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [speed, setSpeed] = useState(4); // 1 (slow) to 8 (fast)
  const [toroidal, setToroidal] = useState(true); // wrap-around edges
  const [showGridLines, setShowGridLines] = useState(true);

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('draw');
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[5]); // Default to Glider
  const [rules, setRules] = useState<GameRules>({ born: [3], survive: [2, 3] });

  // Navigation / canvas viewport zoom & pan
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Grid references to avoid React render lag at high frequency updates
  const gridRef = useRef<GridType>((() => {
    const initialGrid: GridType = [];
    for (let r = 0; r < DEFAULT_ROWS; r++) {
      const row = [];
      for (let c = 0; c < DEFAULT_COLS; c++) {
        row.push({ alive: false, age: 0, trail: 0 });
      }
      initialGrid.push(row);
    }
    return initialGrid;
  })());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanMouseRef = useRef({ x: 0, y: 0 });

  // For preset preview hover on canvas
  const [hoverGridPos, setHoverGridPos] = useState<{ r: number; c: number } | null>(null);

  // Statistics state
  const [stats, setStats] = useState<SimulationStats>({
    generation: 0,
    population: 0,
    peakPopulation: 0,
    gridDensity: 0,
    history: []
  });

  // Sound muter bridge
  useEffect(() => {
    audioSynth.setMute(isMuted);
  }, [isMuted]);

  // Init grid
  const initializeGrid = useCallback((newRows: number, newCols: number, fillRandomChance = 0) => {
    const newGrid: GridType = [];
    let count = 0;
    for (let r = 0; r < newRows; r++) {
      const row = [];
      for (let c = 0; c < newCols; c++) {
        const alive = fillRandomChance > 0 && Math.random() < fillRandomChance;
        if (alive) count++;
        row.push({
          alive,
          age: 0,
          trail: alive ? 1.0 : 0.0
        });
      }
      newGrid.push(row);
    }
    gridRef.current = newGrid;

    // Reset stats
    setStats({
      generation: 0,
      population: count,
      peakPopulation: count,
      gridDensity: newRows * newCols > 0 ? (count / (newRows * newCols)) : 0,
      history: [count]
    });

    setHoverGridPos(null);
  }, []);

  const recenterView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const gridW = cols * CELL_SIZE;
    const gridH = rows * CELL_SIZE;

    setZoom(1.0);
    setPan({
      x: (canvasWidth - gridW) / 2,
      y: (canvasHeight - gridH) / 2
    });
  }, [cols, rows]);

  // Center viewport on mount or when theater mode toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      recenterView();
    }, 60);
    return () => clearTimeout(timer);
  }, [isTheaterMode, recenterView]);

  // Sync state stats
  const syncStats = useCallback(() => {
    const currentGrid = gridRef.current;
    let pop = 0;
    currentGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.alive) pop++;
      });
    });

    setStats(prev => {
      const nextGen = prev.generation + 1;
      const peak = Math.max(prev.peakPopulation, pop);
      const density = (pop / (rows * cols));
      const nextHistory = [...prev.history.slice(-99), pop]; // keep last 100 entries

      return {
        generation: nextGen,
        population: pop,
        peakPopulation: peak,
        gridDensity: density,
        history: nextHistory
      };
    });
  }, [rows, cols]);

  // Evolve Game step
  const evolve = useCallback(() => {
    const currentGrid = gridRef.current;
    if (currentGrid.length === 0) return;

    let pop = 0;
    let changed = 0;
    
    // Pre-calculate next grid
    const nextGrid: GridType = currentGrid.map((row, r) => 
      row.map((cell, c) => {
        // Neighbor count
        let neighbors = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let nr = r + i;
            let nc = c + j;
            if (toroidal) {
              nr = (nr + rows) % rows;
              nc = (nc + cols) % cols;
              if (currentGrid[nr][nc].alive) neighbors++;
            } else {
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (currentGrid[nr][nc].alive) neighbors++;
              }
            }
          }
        }

        let alive = cell.alive;
        let age = cell.age;
        let trail: number;

        if (cell.alive) {
          if (rules.survive.includes(neighbors)) {
            age++;
            trail = 1.0;
          } else {
            alive = false;
            age = 0;
            trail = 0.95; // start decaying
            changed++;
          }
        } else {
          if (rules.born.includes(neighbors)) {
            alive = true;
            age = 0;
            trail = 1.0;
            changed++;
          } else {
            trail = Math.max(0, cell.trail - 0.08); // gradual trail fade
          }
        }

        if (alive) pop++;

        return { alive, age, trail };
      })
    );

    gridRef.current = nextGrid;

    // Trigger synth note
    if (pop > 0 && changed > 0) {
      audioSynth.playEvolveStep(pop, changed, pop / (rows * cols));
    }

    setStats(prev => {
      const nextGen = prev.generation + 1;
      const peak = Math.max(prev.peakPopulation, pop);
      const density = (pop / (rows * cols));
      const nextHistory = [...prev.history.slice(-99), pop];
      return {
        generation: nextGen,
        population: pop,
        peakPopulation: peak,
        gridDensity: density,
        history: nextHistory
      };
    });
  }, [rows, cols, toroidal, rules]);

  // Main canvas render routine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = theme.canvas.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply pan & zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Bounding grid borders
    const gridWidthPx = cols * CELL_SIZE;
    const gridHeightPx = rows * CELL_SIZE;

    // Optional grid lines
    if (showGridLines) {
      ctx.strokeStyle = theme.canvas.gridLine;
      ctx.lineWidth = 0.5 / zoom; // keep line thickness visual size consistent

      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        ctx.moveTo(0, r * CELL_SIZE);
        ctx.lineTo(gridWidthPx, r * CELL_SIZE);
      }
      for (let c = 0; c <= cols; c++) {
        ctx.moveTo(c * CELL_SIZE, 0);
        ctx.lineTo(c * CELL_SIZE, gridHeightPx);
      }
      ctx.stroke();
    } else {
      // Draw grid bounding box
      ctx.strokeStyle = theme.canvas.gridLine;
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(0, 0, gridWidthPx, gridHeightPx);
    }

    // Render cells
    const currentGrid = gridRef.current;
    for (let r = 0; r < rows; r++) {
      if (!currentGrid[r]) continue;
      for (let c = 0; c < cols; c++) {
        const cell = currentGrid[r][c];
        if (!cell) continue;

        if (cell.alive) {
          // Glow or solid based on age
          ctx.fillStyle = cell.age === 0 ? theme.canvas.cellBorn : theme.canvas.cellAlive;
          ctx.fillRect(c * CELL_SIZE + 0.5, r * CELL_SIZE + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
        } else if (cell.trail > 0.01) {
          // Render decay trail with fading colors
          ctx.fillStyle = theme.canvas.cellTrail.replace('0.12', (cell.trail * 0.12).toString());
          ctx.fillRect(c * CELL_SIZE + 0.5, r * CELL_SIZE + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Render Preset Stamp Hover Preview
    if (drawMode === 'preset' && hoverGridPos) {
      const { r: centerR, c: centerC } = hoverGridPos;
      ctx.fillStyle = theme.id === 'classic' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(0, 243, 255, 0.45)';
      
      selectedPreset.cells.forEach(([offsetR, offsetC]) => {
        const targetR = centerR + offsetR;
        const targetC = centerC + offsetC;

        if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols) {
          ctx.fillRect(
            targetC * CELL_SIZE + 0.5, 
            targetR * CELL_SIZE + 0.5, 
            CELL_SIZE - 1, 
            CELL_SIZE - 1
          );
        }
      });

      // Outline boundaries of preset
      ctx.strokeStyle = theme.id === 'classic' ? 'rgba(15, 23, 42, 0.3)' : 'rgba(0, 243, 255, 0.6)';
      ctx.lineWidth = 1 / zoom;
      const startX = (centerC - Math.floor(selectedPreset.width / 2)) * CELL_SIZE;
      const startY = (centerR - Math.floor(selectedPreset.height / 2)) * CELL_SIZE;
      ctx.strokeRect(startX, startY, selectedPreset.width * CELL_SIZE, selectedPreset.height * CELL_SIZE);
    }

    ctx.restore();
  }, [theme, rows, cols, showGridLines, zoom, pan, drawMode, selectedPreset, hoverGridPos]);

  // Playback control and animation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = 0;

    const loop = (time: number) => {
      if (isRunning) {
        const intervalMs = Math.max(30, 700 - speed * 85);
        if (time - lastUpdate >= intervalMs) {
          evolve();
          lastUpdate = time;
        }
      }
      renderCanvas();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, speed, evolve, renderCanvas]);

  // Handle canvas size depending on mode
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isTheaterMode) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      } else {
        canvas.width = 840;
        canvas.height = 520;
      }
      renderCanvas();
    };

    handleResize();

    if (isTheaterMode) {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isTheaterMode, renderCanvas]);

  // Native wheel listener to prevent browser scroll propagation
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault(); // Natively blocks window scrolling!

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Cursor position in grid coordinate space before zoom change
      const gridX = (mouseX - pan.x) / zoom;
      const gridY = (mouseY - pan.y) / zoom;

      // Compute new zoom level
      const zoomFactor = 1.12;
      let nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
      nextZoom = Math.max(0.15, Math.min(15.0, nextZoom)); // limit zoom bounds

      // Calculate new translation to center scale on cursor
      const nextPanX = mouseX - gridX * nextZoom;
      const nextPanY = mouseY - gridY * nextZoom;

      setZoom(nextZoom);
      setPan({ x: nextPanX, y: nextPanY });
    };

    wrapper.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      wrapper.removeEventListener('wheel', handleWheelNative);
    };
  }, [zoom, pan]);

  // Single forward evolution step
  const handleStep = () => {
    if (isRunning) setIsRunning(false);
    evolve();
    renderCanvas();
  };

  // Convert client cursor coords to Grid cell row/col index
  const getGridCoords = (clientX: number, clientY: number): { r: number, c: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    // Click position relative to canvas
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Reverse scale and translate
    const gridX = (x - pan.x) / zoom;
    const gridY = (y - pan.y) / zoom;

    const c = Math.floor(gridX / CELL_SIZE);
    const r = Math.floor(gridY / CELL_SIZE);

    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      return { r, c };
    }
    return null;
  };

  // Toggle cell on draw/erase
  const modifyCell = useCallback((r: number, c: number, mode: DrawMode) => {
    const currentGrid = gridRef.current;
    if (!currentGrid[r] || !currentGrid[r][c]) return;

    const cell = currentGrid[r][c];
    if (mode === 'draw' && !cell.alive) {
      currentGrid[r][c] = { alive: true, age: 0, trail: 1.0 };
      syncStats();
      audioSynth.playClick();
    } else if (mode === 'erase' && cell.alive) {
      currentGrid[r][c] = { alive: false, age: 0, trail: 0.0 };
      syncStats();
      audioSynth.playClick();
    }
  }, [syncStats]);

  // Place preset Stamp
  const placePreset = useCallback((centerR: number, centerC: number) => {
    const currentGrid = gridRef.current;
    let placed = false;

    selectedPreset.cells.forEach(([offsetR, offsetC]) => {
      const targetR = centerR + offsetR;
      const targetC = centerC + offsetC;

      if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols) {
        currentGrid[targetR][targetC] = {
          alive: true,
          age: 0,
          trail: 1.0
        };
        placed = true;
      }
    });

    if (placed) {
      syncStats();
      audioSynth.playPowerUp();
    }
  }, [selectedPreset, rows, cols, syncStats]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      // Middle or Right click: Pan viewport
      isPanningRef.current = true;
      lastPanMouseRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      return;
    }

    if (e.button === 0) {
      // Left Click
      const coords = getGridCoords(e.clientX, e.clientY);
      if (!coords) return;

      if (drawMode === 'preset') {
        placePreset(coords.r, coords.c);
      } else {
        isDrawingRef.current = true;
        modifyCell(coords.r, coords.c, drawMode);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Handling Pan drag
    if (isPanningRef.current) {
      const dx = e.clientX - lastPanMouseRef.current.x;
      const dy = e.clientY - lastPanMouseRef.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPanMouseRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const coords = getGridCoords(e.clientX, e.clientY);

    // Track coordinates for preset hovering preview
    if (drawMode === 'preset') {
      if (coords) {
        setHoverGridPos(coords);
      } else {
        setHoverGridPos(null);
      }
    } else {
      setHoverGridPos(null);
      // Continuous drawing drag
      if (isDrawingRef.current && coords) {
        modifyCell(coords.r, coords.c, drawMode);
      }
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    isPanningRef.current = false;
  };

  const handleMouseLeave = () => {
    isDrawingRef.current = false;
    isPanningRef.current = false;
    setHoverGridPos(null);
  };

  // Zoom wheel events are now handled natively inside useEffect to prevent page scrolling.

  // Prevent default context menu (to allow right click panning)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Preset Selection helper
  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    setDrawMode('preset');
    audioSynth.playClick();
  };

  // Clear Grid
  const handleClear = () => {
    setIsRunning(false);
    initializeGrid(rows, cols);
    audioSynth.playPowerDown();
  };

  // Randomize Grid density
  const handleRandomize = () => {
    setIsRunning(false);
    initializeGrid(rows, cols, 0.22); // 22% density
    audioSynth.playPowerUp();
  };

  // Quick setup helper for rules dropdown selector
  const handleRulePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    const ruleSetup = STANDARD_RULES.find(r => r.name === presetName);
    if (ruleSetup) {
      setRules({
        born: ruleSetup.born,
        survive: ruleSetup.survive
      });
      audioSynth.playClick();
    }
  };

  // Custom B/S rules editing toggles
  const toggleRuleNum = (type: 'born' | 'survive', num: number) => {
    setRules(prev => {
      const activeArray = prev[type];
      const nextArray = activeArray.includes(num)
        ? activeArray.filter(v => v !== num)
        : [...activeArray, num].sort((a, b) => a - b);
      
      audioSynth.playClick();
      return {
        ...prev,
        [type]: nextArray
      };
    });
  };

  // Playback Toggle
  const togglePlayback = () => {
    setIsRunning(prev => {
      const next = !prev;
      if (next) {
        audioSynth.playPowerUp();
      } else {
        audioSynth.playPowerDown();
      }
      return next;
    });
  };

  return (
    <div 
      className="app-container" 
      style={{
        '--bg-app': theme.css.bgApp,
        '--bg-card': theme.css.bgCard,
        '--border': theme.css.border,
        '--accent': theme.css.accent,
        '--accentGlow': theme.css.accentGlow,
        '--text-primary': theme.css.textPrimary,
        '--text-secondary': theme.css.textSecondary
      } as React.CSSProperties}
    >
      <header className="app-header">
        <div className="brand-section">
          <h1 className="app-title">
            <Zap size={32} fill="currentColor" />
            Conway's Game of Life
          </h1>
          <p className="app-subtitle">康威生命游戏 · 交互仿生实验舱</p>
        </div>

        <div className="header-actions">
          {/* Audio toggle */}
          <button 
            className="btn btn-icon-only"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? '开启音效' : '静音'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Grid lines toggle */}
          <button 
            className="btn btn-icon-only"
            onClick={() => setShowGridLines(!showGridLines)}
            title={showGridLines ? '隐藏网格线' : '显示网格线'}
          >
            {showGridLines ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          {/* Theme Selector */}
          <select 
            className="select-input"
            value={theme.id}
            onChange={(e) => {
              const selected = THEMES.find(t => t.id === e.target.value);
              if (selected) {
                setTheme(selected);
                audioSynth.playClick();
              }
            }}
          >
            {THEMES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="layout-grid">
        {/* Top Section: Wide Canvas Board */}
        <div className="glass-card canvas-card" style={{ width: '100%' }}>
          <div className="canvas-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>仿生演化画布</span>
              {isRunning && <span className="simulation-active-indicator" />}
            </div>
            
            <div className="canvas-toolbar">
              <button 
                className="btn"
                onClick={() => {
                  setZoom(z => Math.max(0.15, Math.min(15.0, z * 1.15)));
                  audioSynth.playClick();
                }}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                + 放大
              </button>
              <button 
                className="btn"
                onClick={() => {
                  setZoom(z => Math.max(0.15, Math.min(15.0, z / 1.15)));
                  audioSynth.playClick();
                }}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                - 缩小
              </button>
              <button 
                className="btn"
                onClick={() => {
                  recenterView();
                  audioSynth.playClick();
                }}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                重置视距
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setIsTheaterMode(true);
                  audioSynth.playPowerUp();
                }}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                全屏剧场
              </button>
            </div>
          </div>

          <div 
            ref={canvasWrapperRef}
            className={`canvas-wrapper ${isTheaterMode ? 'theater-mode' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
          >
            <canvas 
              ref={canvasRef}
              className={`canvas-grid-display ${isTheaterMode ? 'theater-mode' : ''}`}
            />
          </div>
          
          {!isTheaterMode && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '840px', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>滚轮: 缩放 | 右键/中键拖拽: 平移视口 | 左键: 绘制/印章盖章</span>
              <span>缩放比例: {Math.round(zoom * 100)}%</span>
            </div>
          )}
        </div>

        {/* Theater mode floating control bar */}
        {isTheaterMode && (
          <div className="theater-toolbar">
            <div className="theater-status">
              代数: {stats.generation} | 存活: {stats.population} | 缩放: {Math.round(zoom * 100)}%
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={togglePlayback}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? '暂停' : '启动'}
            </button>
            
            <button 
              className="btn"
              onClick={handleStep}
              disabled={isRunning}
            >
              <SkipForward size={14} /> 单步
            </button>

            <div className="toggle-group" style={{ width: 'auto', gap: '2px' }}>
              <button 
                className={`toggle-btn ${drawMode === 'draw' ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => { setDrawMode('draw'); audioSynth.playClick(); }}
              >
                激活
              </button>
              <button 
                className={`toggle-btn ${drawMode === 'erase' ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => { setDrawMode('erase'); audioSynth.playClick(); }}
              >
                擦除
              </button>
              <button 
                className={`toggle-btn ${drawMode === 'preset' ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => { setDrawMode('preset'); audioSynth.playClick(); }}
              >
                印章: {selectedPreset.name.split(' ')[0]}
              </button>
            </div>

            <button 
              className="btn"
              onClick={() => {
                recenterView();
                audioSynth.playClick();
              }}
            >
              重置
            </button>

            <button 
              className="btn btn-danger"
              onClick={handleClear}
            >
              清空
            </button>

            <button 
              className="btn"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? '开启音效' : '静音'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button 
              className="btn theater-exit-btn"
              onClick={() => {
                setIsTheaterMode(false);
                audioSynth.playPowerDown();
              }}
            >
              退出全屏
            </button>
          </div>
        )}

        {/* Bottom Columns Section: Responsive Widgets Grid */}
        <div className="widgets-grid">
          
          {/* Card 1: Simulation control */}
          <div className="glass-card">
            <div className="control-label">仿生控制中心</div>
            <div className="control-row">
              <button 
                className={`btn btn-primary`}
                onClick={togglePlayback}
                style={{ flex: '2', height: '42px' }}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? '暂停运行' : '开启模拟'}
              </button>
              
              <button 
                className="btn"
                onClick={handleStep}
                disabled={isRunning}
                title="前进单代"
                style={{ flex: '1', height: '42px' }}
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="control-row">
              <button className="btn btn-danger" onClick={handleClear} style={{ flex: 1 }}>
                <Trash2 size={16} /> 清空网格
              </button>
              <button className="btn" onClick={handleRandomize} style={{ flex: 1 }}>
                <Sparkles size={16} /> 随机繁衍
              </button>
            </div>

            <div className="control-row" style={{ marginTop: '0.5rem' }}>
              <div className="slider-container">
                <div className="slider-header">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>演进速率</span>
                  <span className="slider-val">{speed} 级</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  className="slider-input" 
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="control-row" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>网格尺寸 (Grid Size)</span>
                <select
                  className="select-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  value={`${rows}x${cols}`}
                  onChange={(e) => {
                    const [r, c] = e.target.value.split('x').map(Number);
                    setRows(r);
                    setCols(c);
                    initializeGrid(r, c);
                    audioSynth.playClick();
                  }}
                >
                  <option value="40x60">小 (40 x 60)</option>
                  <option value="50x80">中 (50 x 80)</option>
                  <option value="60x100">大 (60 x 100)</option>
                  <option value="80x120">特大 (80 x 120)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="toroidal" 
                checked={toroidal}
                onChange={() => setToroidal(!toroidal)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="toroidal" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                边界克莱因瓶环绕 (Toroidal Wrap)
              </label>
            </div>
          </div>

          {/* Card 2: Drawing Stamp Mode */}
          <div className="glass-card">
            <div className="control-label">绘图与预设印章</div>
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${drawMode === 'draw' ? 'active' : ''}`}
                onClick={() => { setDrawMode('draw'); audioSynth.playClick(); }}
              >
                <MousePointer size={14} /> 激活细胞
              </button>
              <button 
                className={`toggle-btn ${drawMode === 'erase' ? 'active' : ''}`}
                onClick={() => { setDrawMode('erase'); audioSynth.playClick(); }}
              >
                <Eraser size={14} /> 泯灭清除
              </button>
              <button 
                className={`toggle-btn ${drawMode === 'preset' ? 'active' : ''}`}
                onClick={() => { setDrawMode('preset'); audioSynth.playClick(); }}
              >
                <Stamp size={14} /> 印章模式
              </button>
            </div>

            <div className="preset-section">
              {/* Categorize presets dynamically */}
              {(['Oscillators', 'Spaceships', 'Guns', 'Methuselahs'] as const).map(cat => (
                <React.Fragment key={cat}>
                  <div className="preset-category-title">{cat === 'Oscillators' ? '振荡器 (Periodics)' : cat === 'Spaceships' ? '飞船航线 (Spaceships)' : cat === 'Guns' ? '无限射手 (Guns/Breeders)' : '繁衍长生 (Methuselahs)'}</div>
                  {PRESETS.filter(p => p.category === cat).map(p => (
                    <button
                      key={p.name}
                      className={`preset-item ${selectedPreset.name === p.name && drawMode === 'preset' ? 'selected' : ''}`}
                      onClick={() => handlePresetSelect(p)}
                    >
                      <span className="preset-name">{p.name}</span>
                      <span className="preset-desc">{p.description}</span>
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Card 3: Game rules customizable B/S */}
          <div className="glass-card">
            <div className="control-label">生命演化律法 (Ruleset)</div>
            <div className="rules-container">
              <div className="rules-preset-row">
                <select 
                  className="select-input"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                  onChange={handleRulePresetChange}
                  defaultValue={STANDARD_RULES[0].name}
                >
                  {STANDARD_RULES.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>繁育重生法则 (Born - B):</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {rules.born.join(',')}
                  </span>
                </div>
                <div className="rule-number-matrix">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <button
                      key={`b-${n}`}
                      className={`rule-num-btn ${rules.born.includes(n) ? 'active' : ''}`}
                      onClick={() => toggleRuleNum('born', n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>守望存活法则 (Survive - S):</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {rules.survive.join(',')}
                  </span>
                </div>
                <div className="rule-number-matrix">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <button
                      key={`s-${n}`}
                      className={`rule-num-btn ${rules.survive.includes(n) ? 'active' : ''}`}
                      onClick={() => toggleRuleNum('survive', n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Statistics Dashboard */}
          <div className="glass-card">
            <div className="control-label">
              生命指征监视器 
              {isRunning && <span className="simulation-active-indicator" style={{ marginLeft: '6px' }} />}
            </div>
            
            <div className="stats-grid">
              <div className="stat-box">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>繁衍世代 (Gens)</span>
                <span className="stat-val">{stats.generation}</span>
              </div>
              <div className="stat-box">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>存活细胞数 (Pop)</span>
                <span className="stat-val">{stats.population}</span>
              </div>
              <div className="stat-box">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>历史极值 (Peak)</span>
                <span className="stat-val">{stats.peakPopulation}</span>
              </div>
              <div className="stat-box">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>空间占比 (Density)</span>
                <span className="stat-val">{Math.round(stats.gridDensity * 1000) / 10}%</span>
              </div>

              {/* Sparkline chart of population history */}
              <div className="stat-chart-container">
                <svg width="100%" height="100%" viewBox="0 0 300 60" preserveAspectRatio="none">
                  {stats.history.length > 1 && (
                    <>
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area fill */}
                      <path
                        d={`
                          M 0 60
                          ${stats.history.map((val, i) => {
                            const maxVal = Math.max(1, stats.peakPopulation);
                            const x = (i / (stats.history.length - 1)) * 300;
                            const y = 60 - (val / maxVal) * 50 - 5; // keep margins
                            return `L ${x} ${y}`;
                          }).join(' ')}
                          L 300 60 Z
                        `}
                        fill="url(#chartGlow)"
                      />
                      {/* Sparkline stroke */}
                      <path
                        d={stats.history.map((val, i) => {
                          const maxVal = Math.max(1, stats.peakPopulation);
                          const x = (i / (stats.history.length - 1)) * 300;
                          const y = 60 - (val / maxVal) * 50 - 5;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Full width bottom row: Rules Explainer */}
        <section className="glass-card info-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Info size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>康威生命法则 (Conway's Law) 与生命周期</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            康威生命游戏 (Conway's Game of Life) 是由数学家约翰·何顿·康威在 1970 年设计的细胞自动机。在网格中，每个细胞都有“存活”和“死灭”两种状态，其演变法则由周围 8 个邻居的存活数量决定：
          </p>
          <div className="rules-info-grid">
            <div className="rule-info-card">
              <h4>1. 寂寞死灭</h4>
              <p>当一个存活细胞的邻居细胞少于 2 个时，该细胞因过于孤立而在下一代死灭 (S &lt; 2)。</p>
            </div>
            <div className="rule-info-card">
              <h4>2. 稳定守望</h4>
              <p>当一个存活细胞有 2 个或 3 个邻居细胞时，它能保持繁衍存活到下一代 (S = 2 或 3)。</p>
            </div>
            <div className="rule-info-card">
              <h4>3. 拥挤死灭</h4>
              <p>当一个存活细胞的邻居细胞多于 3 个时，该细胞因资源匮乏或过于拥挤而死灭 (S &gt; 3)。</p>
            </div>
            <div className="rule-info-card">
              <h4>4. 繁育重生</h4>
              <p>当一个死灭细胞周围正好有 3 个存活细胞时，它会在下一代繁育重生 (B = 3)。</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

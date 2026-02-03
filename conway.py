import numpy as np

grid = np.random.choice([0, 1], size=(10, 10), p=[0.5, 0.5]).astype(np.int8)
print(grid)

surround = (
    np.roll(grid, 1, axis=1)
    + np.roll(grid, -1, axis=1)
    + (u := np.roll(grid, 1, axis=0))
    + (d := np.roll(grid, -1, axis=0))
    + np.roll(u, 1, axis=1)
    + np.roll(u, -1, axis=1)
    + np.roll(d, 1, axis=1)
    + np.roll(d, -1, axis=1)
)
print(surround)

bool_grid = (surround == 3) | ((grid == 1) & (surround == 2))
grid = bool_grid.astype(np.int8)
print(grid)

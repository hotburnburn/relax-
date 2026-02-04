import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# grid = np.random.choice([0, 1], size=(10, 10), p=[0.5, 0.5]).astype(np.int8)
# print(grid)
grid = np.zeros((20, 20), dtype=np.int8)
glider = np.array([[0, 1, 0], [0, 0, 1], [1, 1, 1]])
grid[1:4, 1:4] = glider


def conway_life_game(grid):
    while True:
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

        bool_grid = (surround == 3) | ((grid == 1) & (surround == 2))
        grid = bool_grid.astype(np.int8)
        yield grid


conway = conway_life_game(grid)

# 2. 初始化画布
fig, ax = plt.subplots()
initial_data = grid

# 使用 imshow 初始化图像，注意 vmin/vmax 最好固定，否则颜色轴会随每帧波动
im = ax.imshow(initial_data, animated=True, cmap="viridis", vmin=0, vmax=1)
plt.colorbar(im)


# 3. 定义更新函数
def update(frame):
    """
    frame 参数即为生成器下一次 yield 的内容
    """
    im.set_data(frame)
    return [im]  # 必须返回一个包含 artist 的列表


# 4. 创建动画
# frames=gen 直接传入生成器对象
# interval 是帧间隔（毫秒），blit=True 开启局部渲染优化
ani = FuncAnimation(
    fig, update, frames=conway, interval=500, blit=True, cache_frame_data=False
)

plt.show()

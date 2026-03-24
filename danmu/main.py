from textual.app import App
from textual.widgets import Label
import random


# ==========================================
# 1. 定义单个弹幕组件
# ==========================================
class DanmakuItem(Label):
    def __init__(self, text: str, start_y: int, **kwargs):
        super().__init__(text, **kwargs)
        self.danmu_text = text  # ✨ 新增：自己保存一下弹幕文本
        self.start_y = start_y
        self.x_pos = 0.0  # 记录当前的水平位置

    def on_mount(self) -> None:
        """组件挂载到屏幕时的初始化操作"""
        # 设置绝对定位，让弹幕可以自由飘在屏幕上
        self.styles.position = "absolute"

        # 初始位置：X 设为屏幕最右侧，Y 设为传入的随机高度
        self.x_pos = self.app.size.width
        self.styles.offset = (int(self.x_pos), self.start_y)

        # 核心：启动一个高频定时器，每 0.05 秒（50ms）触发一次 tick，相当于 20FPS
        self.set_interval(0.05, self.tick)

    def tick(self) -> None:
        """每一帧的动画逻辑"""
        self.x_pos -= 1.0  # 每次向左移动 1 个字符的距离
        self.styles.offset = (int(self.x_pos), self.start_y)  # 更新在屏幕上的实际位置

        # ✨ 修改：直接用我们刚才保存的 self.danmu_text 来算长度
        if self.x_pos < -len(self.danmu_text):
            self.remove()


# ==========================================
# 2. 定义主程序和画布
# ==========================================
class DanmakuApp(App):
    # CSS 设置：隐藏溢出的内容，防止弹幕飞出屏幕时出现难看的滚动条
    CSS = """
    Screen {
        overflow: hidden; 
    }
    """

    def on_mount(self) -> None:
        """程序启动时的操作"""
        # 启动一个生成器定时器：每 1.5 秒生成一条新弹幕
        self.set_interval(1.5, self.spawn_danmu)
        # 启动时立刻生成一条，免得干等 1.5 秒
        self.spawn_danmu()

    def spawn_danmu(self) -> None:
        """生成弹幕的逻辑"""
        # 在屏幕高度范围内随机选一行
        max_y = self.size.height - 1
        # 防止窗口太小报错，加个判断
        if max_y <= 0:
            return

        random_y = random.randint(0, max_y)

        # 实例化弹幕并将其挂载到屏幕上
        danmu = DanmakuItem("test danmu", start_y=random_y)
        self.mount(danmu)


if __name__ == "__main__":
    DanmakuApp().run()

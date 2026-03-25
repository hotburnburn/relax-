import time
import random
import sys


def dual_progress_bar():
    total = 50
    progress1 = 0
    progress2 = 0

    # 魔法 1：隐藏物理光标，让画面看起来更干净专业
    sys.stdout.write("\033[?25l")

    # 先打印两个空行占位，防止第一次向上移动光标时顶出屏幕边缘
    print("\n")

    try:
        while progress1 < total or progress2 < total:
            # 模拟两个任务不同的随机进度
            if progress1 < total:
                progress1 += random.randint(0, 2)
                progress1 = min(progress1, total)
            if progress2 < total:
                progress2 += random.randint(0, 3)
                progress2 = min(progress2, total)

            # --- 核心绘制逻辑开始 ---

            # 魔法 2：\033[2A 代表将光标向上移动 2 行！
            sys.stdout.write("\033[2A")

            # 拼接第一条进度条 (红色)
            bar1_fill = "█" * progress1
            bar1_empty = "░" * (total - progress1)
            # \033[2K 清空当前行，\r 回到行首，\033[31m 设置红色，\033[0m 重置颜色
            line1 = f"\033[2K\r\033[31m任务 A: [{bar1_fill}{bar1_empty}] {progress1 * 2}%\033[0m"

            # 拼接第二条进度条 (绿色)
            bar2_fill = "█" * progress2
            bar2_empty = "░" * (total - progress2)
            # \033[32m 设置绿色
            line2 = f"\033[2K\r\033[32m任务 B: [{bar2_fill}{bar2_empty}] {progress2 * 2}%\033[0m"

            # 打印这两行内容 (自带换行符)
            print(line1)
            print(line2)

            # --- 核心绘制逻辑结束 ---

            time.sleep(0.1)  # 控制动画帧率

    finally:
        # 魔法 3：无论程序是否报错，退出前一定要把光标显示回来，否则终端光标就消失了！
        sys.stdout.write("\033[?25h")
        print("🎉 全部任务下载完成！")


if __name__ == "__main__":
    dual_progress_bar()

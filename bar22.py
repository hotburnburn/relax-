import time
import random
import sys


def true_color_progress_bar():
    total = 50
    progress1 = 0
    progress2 = 0

    # 魔法 1：24-bit 真彩色 (True Color) 控制符格式为 \033[38;2;R;G;Bm
    # 激光红: RGB(255, 20, 80)
    COLOR_LASER_RED = "\033[38;2;255;20;80m"
    # 荧光绿: RGB(0, 255, 120)
    COLOR_LASER_GREEN = "\033[38;2;0;255;120m"
    # 暗灰色 (用于未完成的细线条槽): RGB(80, 80, 80)
    COLOR_BG_GRAY = "\033[38;2;80;80;80m"
    # 重置颜色
    RESET = "\033[0m"

    sys.stdout.write("\033[?25l")  # 隐藏光标
    print("\n")  # 占位

    try:
        while progress1 < total or progress2 < total:
            if progress1 < total:
                progress1 += random.randint(0, 2)
                progress1 = min(progress1, total)
            if progress2 < total:
                progress2 += random.randint(0, 3)
                progress2 = min(progress2, total)

            sys.stdout.write("\033[2A")  # 光标上移两行

            # --- 替换这里的核心绘制逻辑 ---
            LASER_HEAD = "►"  # 你也可以试试 "▰" 或者 "▶"

            # 拼接第一条进度条 (计算激光身体和头部)
            bar1_body = "━" * (progress1 - 1) if progress1 > 0 else ""
            bar1_head = (
                LASER_HEAD
                if 0 < progress1 < total
                else ("━" if progress1 == total else "")
            )
            bar1_empty = "─" * (total - progress1)
            line1 = f"\033[2K\r{COLOR_LASER_RED}Sys.Core [ {bar1_body}{bar1_head}{COLOR_BG_GRAY}{bar1_empty}{COLOR_LASER_RED} ] {progress1 * 2:>3}%{RESET}"

            # 拼接第二条进度条
            bar2_body = "━" * (progress2 - 1) if progress2 > 0 else ""
            bar2_head = (
                LASER_HEAD
                if 0 < progress2 < total
                else ("━" if progress2 == total else "")
            )
            bar2_empty = "─" * (total - progress2)
            line2 = f"\033[2K\r{COLOR_LASER_GREEN}Net.Link [ {bar2_body}{bar2_head}{COLOR_BG_GRAY}{bar2_empty}{COLOR_LASER_GREEN} ] {progress2 * 2:>3}%{RESET}"
            # ------------------------------
            print(line1)
            print(line2)

            time.sleep(0.08)

    finally:
        sys.stdout.write("\033[?25h")  # 恢复光标
        print(f"\n{COLOR_LASER_GREEN}✦ All systems go. ✦{RESET}")


if __name__ == "__main__":
    true_color_progress_bar()

# -*- coding: utf-8 -*-
"""生成装饰用的假二维码 SVG：看着像二维码，实际扫不出任何内容（纯标准库，无需 Pillow）"""
import random

random.seed(20261005)

N = 29          # 29x29，刻意不是标准尺寸，真扫码器识别不了
CELL = 12
QUIET = 3
SIZE = (N + QUIET * 2) * CELL

rects = []

def add(x, y, color="#000"):
    rects.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>'
                 % ((x + QUIET) * CELL, (y + QUIET) * CELL, CELL, CELL, color))

def finder(cx, cy):
    for dx in range(7):
        for dy in range(7):
            edge = dx in (0, 6) or dy in (0, 6)
            core = 2 <= dx <= 4 and 2 <= dy <= 4
            add(cx + dx, cy + dy, "#000" if (edge or core) else "#fff")

for x in range(N):
    for y in range(N):
        if (x < 8 and y < 8) or (x >= N - 8 and y < 8) or (x < 8 and y >= N - 8):
            continue
        if random.random() < 0.45:
            add(x, y)

finder(0, 0)
finder(N - 7, 0)
finder(0, N - 7)

svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
       'viewBox="0 0 %d %d" shape-rendering="crispEdges">'
       '<rect width="%d" height="%d" fill="#fff"/>%s</svg>'
       % (SIZE, SIZE, SIZE, SIZE, SIZE, SIZE, "".join(rects)))

with open(r"F:\gaibang-website\qrcode_placeholder.svg", "w", encoding="utf-8") as f:
    f.write(svg)
print("svg done, rects=%d" % len(rects))

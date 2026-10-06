// 本文件由 tools/scan_aibench.py 自动生成，请勿手改
window.AIBENCH = {
  "tests": [
    {
      "id": "watch",
      "name": "机械天文腕表",
      "icon": "⌚",
      "keywords": [
        "天文",
        "watch",
        "clock"
      ],
      "desc": "用单个 HTML 实现机械腕表风格的天文时钟：平滑扫秒且不漂移、月相计算、计时码表（含计圈）、日期窗、日出日落指示，纯原生不许用任何库。"
    },
    {
      "id": "qingming",
      "name": "赛博朋克清明上河图",
      "icon": "🏙️",
      "keywords": [
        "清明",
        "qingming"
      ],
      "desc": "用代码画一幅动态赛博朋克版《清明上河图》长卷：自动从右向左滚动、至少 50 个动态元素、鼠标悬停弹出赛博风信息卡片。"
    },
    {
      "id": "billiards",
      "name": "开放式 3D 台球",
      "icon": "🎱",
      "keywords": [
        "台球",
        "billiard"
      ],
      "desc": "开放式命题：先说出你认为一个好的 3D 台球网页该具备哪些体验、玩法、视觉与交互要点，再据此开发成可直接体验的完整作品。"
    },
    {
      "id": "maze",
      "name": "开放式 3D 迷宫",
      "icon": "🌀",
      "keywords": [
        "迷宫",
        "maze"
      ],
      "desc": "开放式命题：题目只给一句话「请你做一个 3D 迷宫」，其余规格由模型自行理解发挥。"
    },
    {
      "id": "astra",
      "name": "Astra 星域粒子",
      "icon": "✨",
      "keywords": [
        "astra",
        "星域",
        "粒子"
      ],
      "desc": "复刻 OpenAI GPT-6 Astra 页面的滚动粒子星域：粒子沿曲线聚成图形、滚动散作星海、鼠标推动粒子、可拖拽旋转，考察 WebGL 着色器与 GPU 粒子渲染。"
    }
  ],
  "models": [
    {
      "slug": "glm53flash",
      "name": "GLM5.3-flash",
      "works": {
        "watch": "glm53flash-watch.html",
        "qingming": "glm53flash-qingming.html"
      }
    },
    {
      "slug": "gpt56luna",
      "name": "GPT-5.6 Luna（ChatGPT免费版）",
      "works": {
        "astra": "gpt56luna-astra.html",
        "billiards": "gpt56luna-billiards.html",
        "maze": "gpt56luna-maze.html",
        "watch": "gpt56luna-watch.html",
        "qingming": "gpt56luna-qingming.html"
      }
    },
    {
      "slug": "hy4preview",
      "name": "Hy4 preview",
      "works": {
        "qingming": "hy4preview-qingming.html"
      }
    },
    {
      "slug": "qwen3827b",
      "name": "Qwen3.8-27b",
      "works": {
        "billiards": "qwen3827b-billiards.html",
        "watch": "qwen3827b-watch.html"
      }
    },
    {
      "slug": "seed21pro",
      "name": "Seed-2.1 Pro",
      "works": {
        "billiards": "seed21pro-billiards.html",
        "maze": "seed21pro-maze.html",
        "watch": "seed21pro-watch.html",
        "qingming": "seed21pro-qingming.html"
      }
    }
  ]
};

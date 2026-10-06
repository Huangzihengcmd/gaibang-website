// 由 tools/scan_aibench.py 自动生成，请勿手改
window.AIBENCH = {
  "tests": [
    {
      "id": "watch",
      "name": "机械天文腕表",
      "en": "ASTRONOMICAL WATCH",
      "sub": "精密规格",
      "grad": "radial-gradient(circle at 50% 30%, #1f3a5f 0%, #101d2e 55%, #060a12 100%)",
      "prompt": "用单个 HTML 文件实现一只机械腕表风格的天文时钟，纯原生实现，不许使用任何库、框架或 CDN。要求：\n\n\n                1. 主表盘读取本地系统时间，秒针平滑扫秒，使用 requestAnimationFrame 驱动，且长时间运行不得累积漂移；切到其他标签页再切回来时，指针必须立即校准到正确时间。\n\n\n                2. 包含一个月相小表盘，根据当前日期计算并显示月相连续变化，公式需要自行实现，精度要求误差控制在 1 天内。\n\n\n                3. 包含一个可用的计时码表，通过子表盘指针显示，支持开始、暂停、继续、归零与计圈（lap），按钮在任意顺序点击都不能出现状态错误。\n\n\n                4. 日期窗显示当前日期，正确处理大小月与闰年。\n\n\n                5. 包含昼夜 / 日出日落指示，用户可在三到四个预设城市之间切换，并根据经纬度现场计算当地日出日落时刻。\n\n\n                6. 页面需要响应式，并尊重 prefers-reduced-motion：开启时秒针改为跳秒并关闭装饰动画；同时为各表盘补充 ARIA 标注。\n\n\n                7. 整体视觉要像一只真实的高级腕表，而不是普通练习作业。\n\n\n                只输出最终代码，不要解释。"
    },
    {
      "id": "qingming",
      "name": "赛博朋克清明上河图",
      "en": "CYBERPUNK SCROLL",
      "sub": "视觉生成",
      "grad": "radial-gradient(circle at 50% 30%, #4a1d5c 0%, #26102f 55%, #0d0710 100%)",
      "prompt": "请不要直接画图，而是编写一段 单个 HTML 文件 的代码，当我用浏览器打开它时，能看到一幅动态的、赛博朋克风格的《清明上河图》长卷。\n\n华丽要求：\n\n画面需要自动从右向左缓缓滚动。\n必须包含至少 50 个动态元素：如闪烁的霓虹灯招牌、飞行的汽车、全息投影的广告、街头的机械义肢行人。\n鼠标悬停在任意店铺上时，要弹出一个赛博风格的信息卡片（如\"老王义体维修店 - 好评率 98%\"）。\n考验实力： 这要求模型具备极强的SVG/Canvas绘图编程能力、CSS动画逻辑以及审美设计能力。普通人只需打开网页就能直观判断谁做得更精美、更流畅。"
    },
    {
      "id": "billiards",
      "name": "开放式 3D 台球",
      "en": "3D POOL",
      "sub": "开放式提示词",
      "grad": "radial-gradient(circle at 50% 30%, #17372f 0%, #0d1a17 55%, #060708 100%)",
      "prompt": "请你做一个 3D 台球。题目本身不再额外给完整规格，而是先请你说说你对这个项目的看法：你觉得一个好的 3D 台球网页应该具备哪些体验、玩法、视觉与交互要点？在表达完你的判断之后，再根据你自己的理解继续开发，并尽可能把它做成一个可以直接体验的完整作品。只输出最终可运行结果，不要解释。"
    },
    {
      "id": "maze",
      "name": "开放式 3D 迷宫",
      "en": "3D MAZE",
      "sub": "开放式提示词",
      "grad": "radial-gradient(circle at 50% 30%, #3d2f14 0%, #231a0b 55%, #0c0904 100%)",
      "prompt": "请你做一个3D迷宫"
    },
    {
      "id": "astra",
      "name": "Astra 星域粒子",
      "en": "ASTRA PARTICLES",
      "sub": "效果复刻",
      "grad": "radial-gradient(circle at 50% 30%, #16394a 0%, #0b1e28 55%, #040a0e 100%)",
      "prompt": "OpenAI 的 GPT-6 Astra 页面（https://openai.com/index/gpt-6-astra/）的首页和中间，有一个很酷炫的动态效果：鼠标滚动的时候粒子可以聚拢和散开，聚拢之后是一个特定的图形，散开之后是一些像星星一样的小点点；鼠标移动到上面，也有互动效果。请复刻这个效果，最好完全一模一样，然后制作一个独立的演示页面。"
    }
  ],
  "models": [
    {
      "slug": "glm53flash",
      "name": "GLM5.3-flash",
      "works": {
        "billiards": "glm53flash-billiards.html",
        "maze": "glm53flash-maze.html",
        "watch": "glm53flash-watch.html",
        "astra": "glm53flash-astra.html",
        "qingming": "glm53flash-qingming.html"
      },
      "dates": {
        "billiards": "2026-10-06",
        "maze": "2026-10-06",
        "watch": "2026-10-06",
        "astra": "2026-10-06",
        "qingming": "2026-10-06"
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
      },
      "dates": {
        "astra": "2026-10-05",
        "billiards": "2026-10-05",
        "maze": "2026-10-05",
        "watch": "2026-10-05",
        "qingming": "2026-10-05"
      }
    },
    {
      "slug": "hy4preview",
      "name": "Hy4 preview",
      "works": {
        "watch": "hy4preview-watch.html",
        "billiards": "hy4preview-billiards.html",
        "qingming": "hy4preview-qingming.html",
        "maze": "hy4preview-maze.html"
      },
      "dates": {
        "watch": "2026-10-06",
        "billiards": "2026-10-06",
        "qingming": "2026-10-06",
        "maze": "2026-10-06"
      }
    },
    {
      "slug": "qwen3827b",
      "name": "Qwen3.8-27b",
      "works": {
        "billiards": "qwen3827b-billiards.html",
        "watch": "qwen3827b-watch.html",
        "qingming": "qwen3827b-qingming.html"
      },
      "dates": {
        "billiards": "2026-10-05",
        "watch": "2026-08-30",
        "qingming": "2026-10-06"
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
      },
      "dates": {
        "billiards": "2026-08-29",
        "maze": "2026-08-29",
        "watch": "2026-08-29",
        "qingming": "2026-08-29"
      }
    }
  ]
};

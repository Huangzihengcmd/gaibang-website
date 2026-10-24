// 由 tools/scan_aibench.py 自动生成，请勿手改
window.AIBENCH = {
  "tests": [
    {
      "id": "astra",
      "name": "Astra 星域粒子",
      "en": "ASTRA PARTICLES",
      "sub": "效果复刻",
      "grad": "radial-gradient(circle at 50% 30%, #16394a 0%, #0b1e28 55%, #040a0e 100%)",
      "prompt": "OpenAI 的 GPT-6 Astra 页面（https://openai.com/index/gpt-6-astra/）的首页和中间，有一个很酷炫的动态效果：鼠标滚动的时候粒子可以聚拢和散开，聚拢之后是一个特定的图形，散开之后是一些像星星一样的小点点；鼠标移动到上面，也有互动效果。请复刻这个效果，最好完全一模一样，然后制作一个独立的演示页面。"
    },
    {
      "id": "watch",
      "name": "机械天文腕表",
      "en": "ASTRONOMICAL WATCH",
      "sub": "精密规格",
      "grad": "radial-gradient(circle at 50% 30%, #1f3a5f 0%, #101d2e 55%, #060a12 100%)",
      "prompt": "用单个 HTML 文件实现一只机械腕表风格的天文时钟，纯原生实现，不许使用任何库、框架或 CDN。要求：\n\n\n                1. 主表盘读取本地系统时间，秒针平滑扫秒，使用 requestAnimationFrame 驱动，且长时间运行不得累积漂移；切到其他标签页再切回来时，指针必须立即校准到正确时间。\n\n\n                2. 包含一个月相小表盘，根据当前日期计算并显示月相连续变化，公式需要自行实现，精度要求误差控制在 1 天内。\n\n\n                3. 包含一个可用的计时码表，通过子表盘指针显示，支持开始、暂停、继续、归零与计圈（lap），按钮在任意顺序点击都不能出现状态错误。\n\n\n                4. 日期窗显示当前日期，正确处理大小月与闰年。\n\n\n                5. 包含昼夜 / 日出日落指示，用户可在三到四个预设城市之间切换，并根据经纬度现场计算当地日出日落时刻。\n\n\n                6. 页面需要响应式，并尊重 prefers-reduced-motion：开启时秒针改为跳秒并关闭装饰动画；同时为各表盘补充 ARIA 标注。\n\n\n                7. 整体视觉要像一只真实的高级腕表，而不是普通练习作业。\n\n\n                只输出最终代码，不要解释。"
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
      "id": "dunhuang",
      "name": "敦煌飞天粒子画",
      "en": "DUNHUANG FLYING APSARA",
      "sub": "粒子艺术",
      "grad": "radial-gradient(circle at 50% 30%, #5c3a1d 0%, #2e1d0e 55%, #100a06 100%)",
      "prompt": "请你做一个敦煌飞天粒子画\n\n网页上有一条飞天飘带，鼠标移动时飘带跟着飘，粒子散开又聚拢，像敦煌壁画活了。\n\n用 Canvas 或 WebGL 实现粒子系统、飘带轨迹、鼠标交互、暂停/回放、移动端适配。"
    },
    {
      "id": "topic6",
      "name": "老式收音机调频台",
      "en": "VINTAGE RADIO",
      "sub": "机械交互",
      "grad": "radial-gradient(circle at 50% 30%, #4a3520 0%, #261a0e 55%, #0e0905 100%)",
      "prompt": "做一个木纹老式收音机。旋钮可以拖拽或触摸旋转，频率随之变化；信号弱时有沙沙噪声，信号强时能听到电台音；支持存 3 个预设台，刷新后预设还在；支持键盘左右调频。音频必须用 Web Audio 程序合成，界面用 CSSCanvas 绘制。最终产物是一个 HTML 文件。\n\n验收点\n旋钮跟手，频率边界正确；噪声和电台音能切换；处理浏览器自动播放限制，用户点击后才出声；预设能存能读能删；手机触摸可调；单文件直接打开无外部请求。"
    },
    {
      "id": "qingming",
      "name": "赛博朋克清明上河图",
      "en": "CYBERPUNK SCROLL",
      "sub": "视觉生成",
      "grad": "radial-gradient(circle at 50% 30%, #4a1d5c 0%, #26102f 55%, #0d0710 100%)",
      "prompt": "请不要直接画图，而是编写一段 单个 HTML 文件 的代码，当我用浏览器打开它时，能看到一幅动态的、赛博朋克风格的《清明上河图》长卷。\n\n华丽要求：\n\n画面需要自动从右向左缓缓滚动。\n必须包含至少 50 个动态元素：如闪烁的霓虹灯招牌、飞行的汽车、全息投影的广告、街头的机械义肢行人。\n鼠标悬停在任意店铺上时，要弹出一个赛博风格的信息卡片（如\"老王义体维修店 - 好评率 98%\"）。\n考验实力： 这要求模型具备极强的SVG/Canvas绘图编程能力、CSS动画逻辑以及审美设计能力。普通人只需打开网页就能直观判断谁做得更精美、更流畅。"
    }
  ],
  "models": [
    {
      "slug": "glm53flash",
      "name": "GLM5.3-flash",
      "works": {
        "billiards": "glm53flash-billiards.html",
        "maze": "glm53flash-maze.html",
        "dunhuang": "glm53flash-dunhuang.html",
        "watch": "glm53flash-watch.html",
        "astra": "glm53flash-astra.html",
        "qingming": "glm53flash-qingming.html"
      },
      "dates": {
        "billiards": "2026-10-06",
        "maze": "2026-10-06",
        "dunhuang": "2026-10-11",
        "watch": "2026-10-06",
        "astra": "2026-10-06",
        "qingming": "2026-10-06"
      }
    },
    {
      "slug": "spacebunny",
      "name": "Space bunny",
      "works": {
        "billiards": "spacebunny-billiards.html",
        "maze": "spacebunny-maze.html",
        "watch": "spacebunny-watch.html",
        "qingming": "spacebunny-qingming.html",
        "dunhuang": "spacebunny-dunhuang.html",
        "astra": "spacebunny-astra.html"
      },
      "dates": {
        "billiards": "2026-10-11",
        "maze": "2026-10-11",
        "watch": "2026-10-11",
        "qingming": "2026-10-11",
        "dunhuang": "2026-10-11",
        "astra": "2026-10-11"
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
        "astra": "hy4preview-astra.html",
        "watch": "hy4preview-watch.html",
        "billiards": "hy4preview-billiards.html",
        "qingming": "hy4preview-qingming.html",
        "maze": "hy4preview-maze.html"
      },
      "dates": {
        "astra": "2026-10-11",
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
        "astra": "qwen3827b-astra.html",
        "billiards": "qwen3827b-billiards.html",
        "watch": "qwen3827b-watch.html",
        "maze": "qwen3827b-maze.html",
        "qingming": "qwen3827b-qingming.html"
      },
      "dates": {
        "astra": "2026-10-06",
        "billiards": "2026-10-05",
        "watch": "2026-08-30",
        "maze": "2026-10-06",
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
    },
    {
      "slug": "step5preview",
      "name": "Step-5-Preview",
      "works": {
        "astra": "step5preview-astra.html",
        "qingming": "step5preview-qingming.html",
        "dunhuang": "step5preview-dunhuang.html"
      },
      "dates": {
        "astra": "2026-10-18",
        "qingming": "2026-10-18",
        "dunhuang": "2026-10-17"
      }
    },
    {
      "slug": "glm53",
      "name": "GLM5.3",
      "works": {
        "topic6": "glm53-topic6.html",
        "astra": "glm53-astra.html"
      },
      "dates": {
        "topic6": "2026-10-18",
        "astra": "2026-10-18"
      }
    },
    {
      "slug": "deekseekv41flash",
      "name": "DeekSeek V4.1-flash",
      "works": {
        "qingming": "deekseekv41flash-qingming.html"
      },
      "dates": {
        "qingming": "2026-10-17"
      }
    },
    {
      "slug": "kimik3",
      "name": "Kimi K3",
      "works": {
        "dunhuang": "kimik3-dunhuang.html"
      },
      "dates": {
        "dunhuang": "2026-10-24"
      }
    }
  ]
};

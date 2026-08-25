---
sidebar_position: 1
title: 基础知识
---

# CS 与工程基础

深入探索每位软件工程师都应了解的底层系统——硬件行为、算法设计、渲染管线、并发执行以及机器学习。

## 学科分类

| 模块 | 内容简介 |
|------|---------|
| [计算机工程](./computer-engineering/intro) | CPU 微架构、内存层次结构、操作系统内核 |
| [算法](./algorithms/intro) | 复杂度分析、数据结构、排序、图算法 |
| [图形学](./graphics/intro) | 光栅化、光线追踪、着色器、GPU 管线 |
| [并发](./concurrency/intro) | 线程、同步原语、无锁结构、异步模型 |
| [人工智能](./artificial-intelligence/intro) | 机器学习基础、神经网络、优化、Transformer |

每个模块均配有交互式模拟器，帮助你直观理解理论知识。

---

## 添加新主题

所有交互式页面共享 `src/components/interactive/shell/` 中的三个基础组件：

| 组件 | 用途 |
|------|------|
| `CEBlock` | 带标题栏和分节标签的外部卡片 |
| `StepControls` | 上一步 / 下一步 / 重置 + 步数计数器 |
| `ColorLegend` | 带悬停提示的彩色色块图例 |

### 操作步骤

1. **复制组件模板**
   `src/components/interactive/shell/_template.js` → `src/components/interactive/MyTopicSimulator.js`
   填写数据数组，替换占位可视化内容。

2. **复制页面模板**
   `fundamentals/<模块>/lesson-notes/_template.mdx` → `lesson-notes/my-topic.mdx`
   更新 `sidebar_position`、标题、导入路径和正文内容。

3. 无需修改导航栏——侧边栏会根据目录结构自动生成。

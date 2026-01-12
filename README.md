# LLM 动画演示

一个交互式可视化演示项目，展示大语言模型（LLM）的工作原理，包括 Transformer 架构原理和 ReAct（推理+行动）模式。

## 项目概述

本项目提供了以下内容的动画化、逐步可视化：
- **Transformer 架构**：展示 LLM 如何通过分词、嵌入、编码器层、注意力机制和解码器处理来处理输入文本
- **ReAct 模式**：展示 AI 智能体如何响应用户查询进行推理和行动
- **SQL 查询处理**：并行演示数据库系统中 SQL 查询的处理过程

## 功能特性

- 🎨 **交互式动画**：LLM 处理步骤的可视化展示
- 📚 **教育内容**：复杂概念的逐步解释
- 🔄 **双重场景**：Transformer 架构和 ReAct 模式演示
- 💻 **现代技术栈**：使用 React 19 和 Vite 构建，开发快速，性能优异
- 🌐 **双语支持**：内容支持中英文

## 技术栈

- **React** 19.2.0
- **Vite** 7.2.4
- **ESLint** 代码质量检查

## 快速开始

### 前置要求

- Node.js (v16 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
```bash
git clone <repository-url>
cd llm-animation-demo
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 在浏览器中打开 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建文件将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
llm-animation-demo/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── App.css          # 应用样式
│   ├── main.jsx         # 应用入口
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── dist/               # 生产构建输出
├── vite.config.js      # Vite 配置
└── package.json        # 项目依赖
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run lint` - 运行 ESLint

## 工作原理

演示项目可视化以下流程：

1. **输入处理**：用户查询的分词和嵌入
2. **编码器层**：带自注意力机制的多层处理
3. **注意力机制**：token 关系可视化
4. **解码器处理**：逐 token 生成响应
5. **输出生成**：最终结果展示

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目是开源的，采用 MIT 许可证。


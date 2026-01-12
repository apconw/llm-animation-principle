# LLM Principle Animation Demo

[中文文档](README.md)

An interactive visualization demo that demonstrates how Large Language Models (LLMs) work, including Transformer architecture principles and the ReAct (Reasoning + Acting) pattern.


## Demo Videos

| LLM Fundamentals | Agent Fundamentals |
|------------------|--------------------|
| <video src="https://github.com/user-attachments/assets/5ba382a4-93a6-45a7-8cc2-f3a05f452825" controls width="100%"></video><br>[Watch video](https://github.com/user-attachments/assets/5ba382a4-93a6-45a7-8cc2-f3a05f452825) | <video src="https://github.com/user-attachments/assets/fafd2efb-e9f2-4503-bace-efea60f82ccd" controls width="100%"></video><br>[Watch video](https://github.com/user-attachments/assets/fafd2efb-e9f2-4503-bace-efea60f82ccd) |
| Text2SQL Fundamentals | DeepResearch Fundamentals |
| <video src="https://github.com/user-attachments/assets/0d5a61d0-6b56-4caa-9c3e-fa67baf32764" controls width="100%"></video><br>[Watch video](https://github.com/user-attachments/assets/0d5a61d0-6b56-4caa-9c3e-fa67baf32764) | <video src="https://github.com/user-attachments/assets/68164969-886e-43da-b0f7-7e3f2696d839" controls width="100%"></video><br>[Watch video](https://github.com/user-attachments/assets/68164969-886e-43da-b0f7-7e3f2696d839) |

## Overview

This project provides an animated, step-by-step visualization of:
- **Transformer Architecture**: How LLMs process input text through tokenization, embedding, encoder layers, attention mechanisms, and decoder processing
- **ReAct Pattern**: How AI agents reason and act in response to user queries
- **SQL Query Processing**: Parallel demonstration of how SQL queries are processed in a database system

## Features

- 🎨 **Interactive Animations**: Visual representation of LLM processing steps
- 📚 **Educational Content**: Step-by-step explanations of complex concepts
- 🔄 **Dual Scenarios**: Transformer architecture and ReAct pattern demonstrations
- 💻 **Modern Stack**: Built with React 19 and Vite for fast development and performance
- 🌐 **Bilingual Support**: Content available in both English and Chinese


## Tech Stack

- **React** 19.2.0
- **Vite** 7.2.4
- **ESLint** for code quality

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd llm-animation-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
llm-animation-demo/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── dist/               # Production build output
├── vite.config.js      # Vite configuration
└── package.json        # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## How It Works

The demo visualizes the following processes:

1. **Input Processing**: User query tokenization and embedding
2. **Encoder Layers**: Multi-layer processing with self-attention
3. **Attention Mechanism**: Token relationship visualization
4. **Decoder Processing**: Response generation token by token
5. **Output Generation**: Final result display

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.


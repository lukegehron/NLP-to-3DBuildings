# 🦖 NLP-to-3DBuildings

An expansion of a 3D parametric modeling playground created for [AEC Tech 2024], focused on generating BIM models from natural language. Imagine combining Figma with large language models (LLMs), but specifically designed for Building Information Modeling (BIM).

## ✨ Features

- 🤝 Real-time collaborative 3D modeling
- 🧱 Parametric components with live updates
- 🎨 Interactive transform controls
- 🔍 Command palette for quick actions
- 👥 Multi-user presence and interaction
- 🎮 Orthographic and perspective camera modes
- 👥 Tag @ai whenever you want to involve LLM in design process

## 🚀 Quick Start

```bash
# Clone the frontend repository
git clone github.com/lukegehron/NLP-to-3DBuildings

# Clone the backend repository
Backend: github.com/franmaranchello/llmto3d-backend

# Clone the UNITY repository
Unity: github.com/franmaranchello/llmto3d-geoengine

# Install dependencies (for frontend)
cd NLP-to-3DBuildings
npm install

# Start the development server (for frontend)
npm run dev
```

Visit `http://localhost:5173` to see your local instance.

## 🛠️ Tech Stack

- **Frontend Framework**: React
- **3D Graphics**: React Three Fiber + Three.js
- **Multiplayer**: Liveblocks
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## 🏗️ Architecture

Buildosaur is built on four core principles:

1. **Composable 3D Graphics**: Using React Three Fiber for declarative 3D rendering, we can create complex 3D scenes using familiar React patterns. Components are built as pure functions that can be easily composed and reused.

2. **Real-time Collaboration**: Powered by Liveblocks, the application maintains a synchronized state across all connected clients. The collaboration system handles presence, cursors, and real-time updates to the 3D model with minimal configuration. It allows users to tag @ai LLM model to provide requested geometry input.

3. **Extensible Component System**: A custom component registry allows for easy addition of new parametric elements. Each component is self-contained with its own controls and update logic, making the system highly extensible.

4. **Simple Deployment**: For workshop purposes, the application is designed as a single-page application (SPA) hosted on GitHub Pages. This eliminates the need for complex backend infrastructure while still providing full collaborative functionality through Liveblocks.

## 🧩 Creating Custom Components

```jsx
// Example component definition
const boxDefinition = {
  component: "Box",
  geometry: {
    type: "BoxGeometry",
    args: ["width", "height", "length"],
  },
  material: {
    type: "MeshStandardMaterial",
    props: {
      color: "color",
    },
  },
  controls: {
    dimensions: {
      width: { value: 1, min: 0.1, max: 10, step: 0.1 },
      height: { value: 1, min: 0.1, max: 10, step: 0.1 },
      length: { value: 1, min: 0.1, max: 20, step: 0.1 },
      scale: { value: 1 },
    },
    appearance: {
      color: { value: "orange" },
    },
  },
  defaultProps: {
    width: 1,
    height: 1,
    length: 1,
    scale: 2,
    color: "orange",
  },
};
```

## 🌟 Motivation

Built for AEC Tech 2024, NLP-to-3DBuildings demonstrates how modern web technologies make it easier than ever to create:

- **Shareable, composable, reactive 3D graphics** using React and React Three Fiber
- **Real-time collaborative experiences** using tools like Liveblocks
- **Rich, interactive interfaces** with modern UI frameworks
- **Smart interaction with AI** through a chatbox

## 📝 Workshop Context

This project is extention of the "Figma for BIM in an Afternoon" workshop Hack at AEC Tech 2024, hosted by Thornton Tomasetti. This project explores capabilities of current LLM models to assist in creating BIM models

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT © Nicolas Schmidt, D-AI-LOG Team 2024

---

Built with ❤️ for AEC Tech 2024

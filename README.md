# 🦖 NLP-to-3DBuildings

A collaborative 3D parametric modeling playground built for [AEC Tech 2024](https://www.aectech.us/nyc-workshops-in-person). Think Figma, but for BIM.

## ✨ Features

- 🤝 Real-time collaborative 3D modeling
- 🧱 Parametric components with live updates
- 🎨 Interactive transform controls
- 🔍 Command palette for quick actions
- 👥 Multi-user presence and interaction
- 🎮 Orthographic and perspective camera modes

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ngimbal/buildosaur.git

# Install dependencies
cd buildosaur
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to see your local instance.

## 🛠️ Tech Stack

- **Frontend Framework**: React
- **3D Graphics**: React Three Fiber + Three.js
- **Multiplayer**: Liveblocks
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Type Safety**: TypeScript

## 🏗️ Architecture

Buildosaur is built on four core principles:

1. **Composable 3D Graphics**: Using React Three Fiber for declarative 3D rendering, we can create complex 3D scenes using familiar React patterns. Components are built as pure functions that can be easily composed and reused.

2. **Real-time Collaboration**: Powered by Liveblocks, the application maintains a synchronized state across all connected clients. The collaboration system handles presence, cursors, and real-time updates to the 3D model with minimal configuration.

3. **Extensible Component System**: A custom component registry allows for easy addition of new parametric elements. Each component is self-contained with its own controls and update logic, making the system highly extensible.

4. **Simple Deployment**: For workshop purposes, the application is designed as a single-page application (SPA) hosted on GitHub Pages. This eliminates the need for complex backend infrastructure while still providing full collaborative functionality through Liveblocks.

## 🧩 Creating Custom Components

```tsx
// Example component definition
export const BoxDefinition: BaseComponentDefinition = {
  component: Box,
  getControls: (id, updateComponent) => ({
    dimensions: folder({
      width: { value: 1, min: 0.1, max: 10, step: 0.1 },
      height: { value: 1, min: 0.1, max: 10, step: 0.1 },
      length: { value: 10, min: 0.1, max: 20, step: 0.1 },
    }),
  }),
};
```

## 🌟 Motivation

Built for AEC Tech 2024, Buildosaur demonstrates how modern web technologies make it easier than ever to create:

- **Shareable, composable, reactive 3D graphics** using React and React Three Fiber
- **Real-time collaborative experiences** using tools like Liveblocks
- **Rich, interactive interfaces** with modern UI frameworks

## 📝 Workshop Context

This project was created for the "Figma for BIM in an Afternoon" workshop at AEC Tech 2024, hosted by Thornton Tomasetti. The workshop demonstrates how to build and deploy a collaborative 3D parametric modeling application using modern web technologies.

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT © Nicolas Schmidt 2024

---

Built with ❤️ for AEC Tech 2024

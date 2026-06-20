# AlgoViz - Data Structures & Algorithms Visualizer

## 🚀 Project Overview

AlgoViz is an interactive web-based educational platform that visualizes fundamental data structures and algorithms. Built with React and modern web technologies, it transforms complex algorithmic concepts into intuitive, animated visualizations to enhance learning and understanding.

## ✨ Live Demo

🌐 **Live Site**: [AlgoViz](https://main.d3kx4fm5ys34yo.amplifyapp.com/)

## 🎯 Features

### 📊 **Data Structure Visualizations**

#### **Stack Operations**
- ✅ Push, Pop, Peek operations with real-time animation
- ✅ Infix to Postfix/Prefix conversion with step-by-step visualization
- ✅ Expression parsing and evaluation
- ✅ Operator precedence visualization
- ✅ Parentheses matching demonstration

#### **Queue Operations**
- ✅ Regular Queue (FIFO) with animated enqueue/dequeue
- ✅ Circular Queue with wrap-around visualization
- ✅ Front/Rear pointer tracking
- ✅ Queue statistics and utilization metrics
- ✅ Dynamic vs Fixed-size queue comparison

#### **Tree Traversals**
- ✅ Binary Tree visualization
- ✅ In-order, Pre-order, Post-order traversals
- ✅ Breadth-First Search (BFS) animation
- ✅ Depth-First Search (DFS) animation
- ✅ Tree construction and manipulation

#### **Graph Algorithms**
- ✅ Graph creation with interactive nodes and edges
- ✅ Dijkstra's shortest path algorithm
- ✅ Graph traversal animations

#### **Sorting Algorithms**
- ✅ Bubble Sort with step-by-step comparison
- ✅ Selection Sort visualization
- ✅ Insertion Sort animation
- ✅ Merge Sort divide-and-conquer demonstration
- ✅ Quick Sort pivot selection and partitioning

#### **Searching Algorithms**
- ✅ Linear Search with element highlighting
- ✅ Binary Search on sorted arrays
- ✅ Binary Search Tree operations
- ✅ Searching complexity comparisons

### 🎨 **Interactive Features**
- 🎮 Real-time algorithm execution controls (Play/Pause/Step/Reset)
- 📱 Fully responsive design for all devices
- 🎯 Visual highlighting of active operations
- 📊 Runtime performance tracking
- 🎨 Color-coded elements for better understanding
- 📖 Step-by-step algorithm explanations
- 🚀 Multiple visualization modes
- 💾 Save/Load visualization states

## 🛠️ Technology Stack

### **Frontend**
- ⚛️ React 18 with JavaScript
- 🎨 Tailwind CSS for styling
- 🌀 Framer Motion for animations
- 📊 Chart.js for data visualization
- 🎯 React Router for navigation

### **Development Tools**
- ⚡ Vite for fast development and building
- 📦 npm for package management
- 🔧 ESLint & Prettier for code quality
- 🐙 GitHub for version control
- ☁️ Vercel for deployment

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 16+ 
- npm 7+ or yarn/pnpm

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone https://github.com/adityaagg4689/AlgoViz.git
   cd AlgoViz
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### **Build for Production**
```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
AlgoViz/
├── public/                      # Static assets
├── src/
│   ├── components/              # Reusable components
│   │   ├── NavBar/             # Navigation component
│   │   ├── Visualizer/         # Core visualizer components
│   │   ├── Controls/           # Algorithm controls
│   │   ├── InfoPanel/          # Information panels
│   │   └── Legend/             # Visualization legends
│   ├── pages/                  # Main pages
│   │   ├── StackPage/          # Stack visualizations
│   │   ├── QueuePage/          # Queue visualizations
│   │   ├── TreePage/           # Tree visualizations
│   │   ├── GraphPage/          # Graph visualizations
│   │   ├── ArrayPage/        # Array algorithms
│   │   └── HomePage/           # Landing page
│   ├── utils/                  # Utility functions
│   │   ├── algorithms/         # Algorithm implementations
│   │   ├── helpers/           # Helper functions
│   │   └── constants/         # Constants and configurations
│   ├── styles/                 # Global styles
│   ├── types/                  # TypeScript definitions
│   ├── assets/                 # Images, icons, etc.
│   └── App.tsx                 # Root component
├── package.json
├── vite.config.js
└── README.md
```

## 🎮 How to Use

### **Stack Visualizer**
1. Navigate to Stack section
2. Enter values to push onto stack
3. Use operation buttons (Push/Pop/Peek)
4. Try expression conversion with examples

### **Queue Visualizer**
1. Select Regular or Circular Queue
2. Enqueue values and observe FIFO behavior
3. Watch pointer movements in circular queue
4. Monitor queue statistics

### **Array Visualizer**
1. Generate random array
2. Select sorting algorithm
3. Control animation speed
4. Observe comparisons and swaps

### **Graph Visualizer**
1. Add nodes and edges
2. Select algorithm (Dijkstra's, etc.)
3. Watch path finding in real-time
4. Adjust weights and configurations

## 🏗️ Architecture

### **Component Design**
- **Container Components**: Manage state and logic
- **Presentation Components**: Handle UI rendering
- **Animation Components**: Control visual transitions
- **Control Components**: User interaction handling

### **State Management**
- React hooks for local state
- Context API for global state
- Custom hooks for algorithm logic

### **Animation System**
- Frame-based animation engine
- Smooth transitions using Framer Motion
- Step-by-step algorithm visualization

## 📚 Educational Value

### **Learning Objectives**
- Understand algorithmic thinking
- Visualize data structure operations
- Compare algorithm complexities
- Develop problem-solving skills

### **Target Audience**
- Computer Science students
- Coding interview preparers
- Educators and teachers
- Self-learners and enthusiasts

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Areas for Contribution**
- Add new algorithm visualizations
- Improve existing visualizations
- Enhance UI/UX design
- Add educational content
- Fix bugs and issues
- Optimize performance

## 🐛 Issue Reporting

Found a bug or have a feature request? Please:
1. Check existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce (for bugs)
4. Add screenshots if applicable

## 👥 Authors

- **Aditya Aggarwal** - *Project Lead & Developer*

## 🙏 Acknowledgments

- Inspired by various algorithm visualization tools

---

**Happy Learning!** 🚀

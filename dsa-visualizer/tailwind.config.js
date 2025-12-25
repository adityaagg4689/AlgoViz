/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-fast': 'pulse 1s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'highlight-pulse': 'highlightPulse 2s ease-in-out infinite',
        'node-insert': 'nodeInsert 0.8s ease-out forwards',
        'node-rotate': 'nodeRotate 0.6s ease-out',
        'path-traverse': 'pathTraverse 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'tree-grow': 'treeGrow 1s ease-out forwards',
        'connection-draw': 'connectionDraw 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        fadeInDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideInRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        bounceGentle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': { 
            transform: 'translateY(-10px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        },
        bounceSubtle: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
          },
          '50%': { 
            transform: 'translateY(-5px) scale(1.05)',
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)',
          },
          '50%': { 
            transform: 'translateY(-15px)',
          },
        },
        highlightPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.7)',
          },
          '50%': { 
            boxShadow: '0 0 0 10px rgba(245, 158, 11, 0)',
          },
        },
        nodeInsert: {
          '0%': { 
            transform: 'scale(0) rotate(-180deg)',
            opacity: '0',
          },
          '70%': { 
            transform: 'scale(1.2) rotate(10deg)',
            opacity: '1',
          },
          '100%': { 
            transform: 'scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
        nodeRotate: {
          '0%': { 
            transform: 'rotate(0deg)',
          },
          '100%': { 
            transform: 'rotate(360deg)',
          },
        },
        pathTraverse: {
          '0%': { 
            strokeDasharray: '0, 100',
            strokeDashoffset: '0',
          },
          '50%': { 
            strokeDasharray: '100, 0',
            strokeDashoffset: '100',
          },
          '100%': { 
            strokeDasharray: '0, 100',
            strokeDashoffset: '200',
          },
        },
        glow: {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 2px rgba(139, 92, 246, 0.5))',
          },
          '50%': { 
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))',
          },
        },
        treeGrow: {
          '0%': { 
            transform: 'scaleY(0)',
            opacity: '0',
          },
          '100%': { 
            transform: 'scaleY(1)',
            opacity: '1',
          },
        },
        connectionDraw: {
          '0%': { 
            strokeDashoffset: '100',
          },
          '100%': { 
            strokeDashoffset: '0',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-tree': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-bst': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-avl': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-node': 'linear-gradient(145deg, var(--tw-gradient-stops))',
        'gradient-highlight': 'linear-gradient(145deg, #f6d365 0%, #fda085 100%)',
      },
      colors: {
        'tree-primary': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        'tree-secondary': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'tree-accent': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        'tree-success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      boxShadow: {
        'tree-sm': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'tree-md': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'tree-lg': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
        'tree-xl': '0 20px 40px rgba(0,0,0,0.20), 0 5px 10px rgba(0,0,0,0.15)',
        'node-soft': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'node-hard': '0 20px 60px rgba(0, 0, 0, 0.3)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'transform': 'transform',
        'all': 'all',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
      },
      transitionTimingFunction: {
        'tree-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'tree-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
    },
  },
  plugins: [],
}
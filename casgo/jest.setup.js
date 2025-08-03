// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add missing TextEncoder/TextDecoder for modern web APIs
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Mock HTMLCanvasElement.getContext to fix jsPDF issue
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Array(4)
      })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({
        data: new Array(4)
      })),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 10 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    };
  }
  return null;
});

// Mock canvas toDataURL method
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,');

// Mock URL properly to handle both constructor and static methods
class MockURL {
  constructor(url, base) {
    this.href = url;
    this.origin = 'https://test.com';
    this.protocol = 'https:';
    this.hostname = 'test.com';
    this.pathname = '/';
    this.search = '';
    this.hash = '';
  }
  
  toString() {
    return this.href;
  }
}

MockURL.createObjectURL = jest.fn(() => 'mocked-url');
MockURL.revokeObjectURL = jest.fn();

global.URL = MockURL;

// Mock window methods
Object.defineProperty(window, 'open', {
  value: jest.fn(),
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock document methods for creating and manipulating DOM elements
const mockElement = {
  click: jest.fn(),
  remove: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  style: {},
  href: '',
  download: '',
};

// Enhance document.createElement to return proper DOM elements
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName) => {
  const element = originalCreateElement(tagName);
  
  // Add any missing methods/properties
  if (tagName === 'a') {
    element.click = jest.fn();
    element.remove = jest.fn();
  }
  
  if (tagName === 'canvas') {
    element.getContext = HTMLCanvasElement.prototype.getContext;
    element.toDataURL = HTMLCanvasElement.prototype.toDataURL;
    element.width = 100;
    element.height = 100;
  }
  
  return element;
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock crypto for random ID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock process.env for tests
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
};

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Store original console methods
const originalError = console.error;
const originalLog = console.log;

// Combined beforeEach and afterEach for DOM setup and console mocking
beforeEach(() => {
  // Create a proper DOM container for React Testing Library
  const container = document.createElement('div');
  container.setAttribute('id', 'root');
  document.body.appendChild(container);
  
  // Mock console methods
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Clean up DOM after each test
  document.body.innerHTML = '';
  
  // Restore console methods
  console.error = originalError;
  console.log = originalLog;
}); 
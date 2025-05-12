// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock the Three.js library
jest.mock('three', () => {
  return {
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement('canvas')
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn()
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn()
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() }
    })),
    BoxGeometry: jest.fn(),
    SphereGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      rotation: { set: jest.fn() }
    })),
    Color: jest.fn(),
    Vector3: jest.fn().mockImplementation((x, y, z) => ({ x, y, z })),
    LoadingManager: jest.fn().mockImplementation(() => ({
      onProgress: jest.fn(),
      onLoad: jest.fn(),
      onError: jest.fn()
    })),
    STLLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn()
    }))
  };
});

// Mock the window.requestAnimationFrame
window.requestAnimationFrame = jest.fn(cb => cb());

// Mock the IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    this.observe = jest.fn(element => {
      this.elements.add(element);
    });
    this.unobserve = jest.fn(element => {
      this.elements.delete(element);
    });
    this.disconnect = jest.fn();
    this.trigger = entries => {
      this.callback(entries, this);
    };
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock the localStorage API
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock browser APIs that might not exist in JSDOM
if (!window.matchMedia) {
  window.matchMedia = jest.fn().mockImplementation(query => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
  });
}

// Silence console errors during tests
const originalConsoleError = console.error;
console.error = jest.fn();

// Restore console after tests
afterAll(() => {
  console.error = originalConsoleError;
}); 
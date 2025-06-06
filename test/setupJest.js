// Setup file for Jest tests
// Mock D3.js
global.d3 = {
  select: jest.fn(() => ({
    attr: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    data: jest.fn().mockReturnThis(),
    enter: jest.fn().mockReturnThis()
  })),
  polygonHull: jest.fn((points) => points.length >= 3 ? points : null),
};

// Mock DOM elements and events
global.document = {
  getElementById: jest.fn((id) => ({
    value: 'mock-value',
    addEventListener: jest.fn(),
    style: { display: 'block' },
    getBoundingClientRect: jest.fn(() => ({ width: 800, height: 600 })),
    textContent: '',
  })),
  addEventListener: jest.fn(),
};

global.window = {
  addEventListener: jest.fn()
};

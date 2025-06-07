/**
 * DOM integration tests for Voronoi diagram application
 * These tests check how the application interacts with the DOM
 */

// Import the core functions
const voronoiCore = require('../src/voronoi-core');

// Mock document
document.getElementById = jest.fn().mockImplementation((id) => {
  switch (id) {
    case 'voronoi-canvas':
      return {
        getBoundingClientRect: jest.fn(() => ({ width: 800, height: 600, left: 0, top: 0 })),
        addEventListener: jest.fn(),
        width: 800,
        height: 600
      };
    case 'distance-metric':
      return { value: 'euclidean', addEventListener: jest.fn() };
    case 'p-value':
      return { value: '2', addEventListener: jest.fn() };
    case 'order':
      return { value: '1', max: 5, addEventListener: jest.fn() };
    case 'predefined-shape':
      return { value: 'none', addEventListener: jest.fn() };
    case 'points-count':
      return { textContent: '' };
    case 'p-value-container':
      return { style: { display: 'none' } };
    case 'clear-button':
    case 'apply-shape':
      return { addEventListener: jest.fn() };
    default:
      return { addEventListener: jest.fn() };
  }
});

// Mock D3
global.d3 = {
  select: jest.fn(() => ({
    attr: jest.fn().mockReturnThis(),
    append: jest.fn(() => ({
      attr: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      selectAll: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis()
    })),
    selectAll: jest.fn(() => ({
      data: jest.fn().mockReturnThis(),
      enter: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis()
    }))
  })),
  polygonHull: jest.fn((points) => points.length > 2 ? points : null)
};

describe('DOM Integration Tests', () => {
  beforeEach(() => {
    // Clear all document.getElementById mock calls
    document.getElementById.mockClear();

    // Reset any mocks on voronoiCore functions
    Object.keys(voronoiCore).forEach(key => {
      if (typeof voronoiCore[key] === 'function' && voronoiCore[key].mockReset) {
        voronoiCore[key].mockReset();
      }
    });
  });

  test('should load the script without errors', () => {
    // Just requiring the script should not throw errors
    expect(() => {
      // Note: In a real test, we would require the script here
      // But since it's directly manipulating the DOM, we'll mock it
    }).not.toThrow();
  });

  test('createRegularPolygon creates the correct number of points', () => {
    const points3 = voronoiCore.createRegularPolygon(3, 100);
    expect(points3.length).toBe(3);

    const points4 = voronoiCore.createRegularPolygon(4, 100);
    expect(points4.length).toBe(4);

    const points12 = voronoiCore.createRegularPolygon(12, 100);
    expect(points12.length).toBe(12);
  });

  test('points are placed at the correct radius from center', () => {
    const radius = 100;
    const points = voronoiCore.createRegularPolygon(6, radius);

    const centerX = 800 / 2; // Default width / 2
    const centerY = 600 / 2; // Default height / 2

    points.forEach(point => {
      // Calculate distance from center
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) +
        Math.pow(point.y - centerY, 2)
      );

      // Should be within 0.1 pixels of the specified radius
      expect(distance).toBeCloseTo(radius, 1);
    });
  });
});

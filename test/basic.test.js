// Basic test for voronoi-core.js functions
const voronoiCore = require('../src/voronoi-core');

test('voronoi-core exports the expected functions', () => {
  expect(voronoiCore.calculateDistance).toBeDefined();
  expect(typeof voronoiCore.calculateDistance).toBe('function');

  expect(voronoiCore.createRegularPolygon).toBeDefined();
  expect(typeof voronoiCore.createRegularPolygon).toBe('function');
});

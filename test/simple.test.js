/**
 * Simple test for the voronoi-core functions
 */

const voronoiCore = require('../src/voronoi-core');

test('regular polygon function exists', () => {
  expect(typeof voronoiCore.createRegularPolygon).toBe('function');
});

test('createGridOfPoints function exists', () => {
  expect(typeof voronoiCore.createGridOfPoints).toBe('function');
});

test('createRegularPolygon creates correct number of points', () => {
  const triangle = voronoiCore.createRegularPolygon(3, 100);
  expect(triangle.length).toBe(3);
  
  const square = voronoiCore.createRegularPolygon(4, 100);
  expect(square.length).toBe(4);
});

// Direct test file that doesn't need Jest discovery
const assert = require('assert');
const voronoiCore = require('../src/voronoi-core');

function runTests() {
  console.log('Running Voronoi core function tests...');

  // Test that functions exist
  assert(typeof voronoiCore.calculateDistance === 'function', 'calculateDistance should be a function');
  assert(typeof voronoiCore.createRegularPolygon === 'function', 'createRegularPolygon should be a function');
  assert(typeof voronoiCore.createCircleOfPoints === 'function', 'createCircleOfPoints should be a function');
  assert(typeof voronoiCore.createRandomPoints === 'function', 'createRandomPoints should be a function');
  assert(typeof voronoiCore.createGridOfPoints === 'function', 'createGridOfPoints should be a function');
  assert(typeof voronoiCore.getCentroid === 'function', 'getCentroid should be a function');
  console.log('✓ All functions exist');

  // Test distance metrics
  const euclideanDist = voronoiCore.calculateDistance(0, 0, 3, 4, 'euclidean');
  assert(euclideanDist === 5, `Expected Euclidean distance to be 5, got ${euclideanDist}`);

  const manhattanDist = voronoiCore.calculateDistance(0, 0, 3, 4, 'manhattan');
  assert(manhattanDist === 7, `Expected Manhattan distance to be 7, got ${manhattanDist}`);

  const minkowskiDist = voronoiCore.calculateDistance(0, 0, 3, 4, 'minkowski', 2);
  assert(Math.abs(minkowskiDist - 5) < 0.0001, `Expected Minkowski (p=2) distance to be 5, got ${minkowskiDist}`);

  const hilbertDist = voronoiCore.calculateDistance(0, 0, 80, 60, 'hilbert', 2, 800, 600);
  assert(hilbertDist === 60, `Expected Hilbert distance to be 60, got ${hilbertDist}`);

  // Test default case (should be same as Euclidean)
  const defaultDist = voronoiCore.calculateDistance(0, 0, 3, 4, 'unknown-metric');
  assert(defaultDist === 5, `Expected default distance to be 5 (same as Euclidean), got ${defaultDist}`);
  console.log('✓ Default distance metric fallback works correctly');

  console.log('✓ Distance metrics calculation works correctly');

  // Test regular polygon creation
  const triangle = voronoiCore.createRegularPolygon(3, 100);
  assert(triangle.length === 3, 'Triangle should have 3 points');

  const square = voronoiCore.createRegularPolygon(4, 100);
  assert(square.length === 4, 'Square should have 4 points');

  const dodecagon = voronoiCore.createRegularPolygon(12, 100);
  assert(dodecagon.length === 12, 'Dodecagon should have 12 points');
  console.log('✓ Regular polygon generation works correctly');

  // Test centroid calculation
  const centroid = voronoiCore.getCentroid([[0, 0], [4, 0], [2, 4]]);
  assert(centroid[0] === 2, `Expected centroid x to be 2, got ${centroid[0]}`);
  assert(centroid[1] === (4/3), `Expected centroid y to be 1.33, got ${centroid[1]}`);
  console.log('✓ Centroid calculation works correctly');

  // Test grid generation
  const grid = voronoiCore.createGridOfPoints(2, 3);
  assert(grid.length === 6, `Expected grid to have 6 points (2×3), got ${grid.length}`);
  console.log('✓ Grid generation works correctly');

  console.log('\n✅ All tests passed!');
}

runTests();

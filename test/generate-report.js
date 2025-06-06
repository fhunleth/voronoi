// Test reporter that generates an HTML report
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const voronoiCore = require('../src/voronoi-core');

// Results collector
const testResults = {
    timestamp: new Date().toLocaleString(),
    passed: 0,
    failed: 0,
    sections: []
};

// Test util functions
function runTest(name, testFn) {
    try {
        testFn();
        testResults.passed++;
        return { name, passed: true };
    } catch (error) {
        testResults.failed++;
        return {
            name,
            passed: false,
            error: error.message
        };
    }
}

// Run distance tests
const distanceTests = {
    name: 'Distance Metrics',
    tests: []
};

distanceTests.tests.push(runTest('Euclidean distance', () => {
    const dist = voronoiCore.calculateDistance(0, 0, 3, 4, 'euclidean');
    assert(dist === 5, `Expected 5, got ${dist}`);
}));

distanceTests.tests.push(runTest('Manhattan distance', () => {
    const dist = voronoiCore.calculateDistance(0, 0, 3, 4, 'manhattan');
    assert(dist === 7, `Expected 7, got ${dist}`);
}));

distanceTests.tests.push(runTest('Minkowski distance (p=2)', () => {
    const dist = voronoiCore.calculateDistance(0, 0, 3, 4, 'minkowski', 2);
    assert(Math.abs(dist - 5) < 0.0001, `Expected 5, got ${dist}`);
}));

distanceTests.tests.push(runTest('Hilbert distance', () => {
    const dist = voronoiCore.calculateDistance(0, 0, 80, 60, 'hilbert', 2, 800, 600);
    assert(dist === 60, `Expected 60, got ${dist}`);
}));

distanceTests.tests.push(runTest('Default distance fallback', () => {
    const dist = voronoiCore.calculateDistance(0, 0, 3, 4, 'unknown-metric');
    assert(dist === 5, `Expected 5, got ${dist}`);
}));

testResults.sections.push(distanceTests);

// Run shape generation tests
const shapeTests = {
    name: 'Shape Generation',
    tests: []
};

shapeTests.tests.push(runTest('Regular polygon (triangle)', () => {
    const triangle = voronoiCore.createRegularPolygon(3, 100);
    assert(triangle.length === 3, `Expected 3 points, got ${triangle.length}`);
}));

shapeTests.tests.push(runTest('Regular polygon (square)', () => {
    const square = voronoiCore.createRegularPolygon(4, 100);
    assert(square.length === 4, `Expected 4 points, got ${square.length}`);
}));

shapeTests.tests.push(runTest('Regular polygon (dodecagon)', () => {
    const dodecagon = voronoiCore.createRegularPolygon(12, 100);
    assert(dodecagon.length === 12, `Expected 12 points, got ${dodecagon.length}`);
}));

shapeTests.tests.push(runTest('Grid generation', () => {
    const grid = voronoiCore.createGridOfPoints(2, 3);
    assert(grid.length === 6, `Expected 6 points, got ${grid.length}`);
}));

// Mock Math.random for the random points test
const originalRandom = Math.random;
Math.random = () => 0.5;
shapeTests.tests.push(runTest('Random points generation', () => {
    const random = voronoiCore.createRandomPoints(5);
    assert(random.length === 5, `Expected 5 points, got ${random.length}`);
}));
// Restore the original Math.random
Math.random = originalRandom;

testResults.sections.push(shapeTests);

// Run geometry utility tests
const geometryTests = {
    name: 'Geometry Utilities',
    tests: []
};

geometryTests.tests.push(runTest('Centroid calculation', () => {
    const centroid = voronoiCore.getCentroid([[0, 0], [4, 0], [2, 4]]);
    assert(centroid[0] === 2, `Expected centroid x to be 2, got ${centroid[0]}`);
    assert(centroid[1] === (4/3), `Expected centroid y to be 1.33, got ${centroid[1]}`);
}));

testResults.sections.push(geometryTests);

// Generate the HTML report
const templatePath = path.join(__dirname, 'report-template.html');
const outputPath = path.join(__dirname, '..', 'test-report.html');

let template = fs.readFileSync(templatePath, 'utf8');
template = template.replace('REPLACE_WITH_TEST_RESULTS', JSON.stringify(testResults, null, 2));

fs.writeFileSync(outputPath, template);

// Print a summary to the console
console.log('\n=== Test Report Summary ===');
console.log(`Run at: ${testResults.timestamp}`);
console.log(`Total tests: ${testResults.passed + testResults.failed}`);
console.log(`Passed: ${testResults.passed}`);
console.log(`Failed: ${testResults.failed}`);
console.log('===========================');

console.log(`\nHTML report generated at: ${outputPath}`);
console.log('Open this file in your browser to view the detailed test report.\n');

// Exit with appropriate code
process.exit(testResults.failed > 0 ? 1 : 0);

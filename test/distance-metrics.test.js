/**
 * Tests for the distance metrics in the Voronoi diagram application
 */

const { calculateDistance } = require('../src/voronoi-core');

describe('Distance Metric Tests', () => {
    // Test coordinates
    const testCases = [
        { p1: [0, 0], p2: [3, 4], label: 'origin to (3,4)' },
        { p1: [5, 5], p2: [8, 9], label: '(5,5) to (8,9)' },
        { p1: [-2, -2], p2: [1, 2], label: 'negative coordinates' },
        { p1: [100, 200], p2: [400, 500], label: 'large coordinates' }
    ];

    describe('Euclidean Distance', () => {
        testCases.forEach(({ p1, p2, label }) => {
            test(`calculates correctly for ${label}`, () => {
                const expectedDistance = Math.sqrt(
                    Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
                );
                expect(calculateDistance(p1[0], p1[1], p2[0], p2[1], 'euclidean'))
                    .toBeCloseTo(expectedDistance);
            });
        });
    });

    describe('Manhattan Distance', () => {
        testCases.forEach(({ p1, p2, label }) => {
            test(`calculates correctly for ${label}`, () => {
                const expectedDistance =
                    Math.abs(p2[0] - p1[0]) + Math.abs(p2[1] - p1[1]);
                expect(calculateDistance(p1[0], p1[1], p2[0], p2[1], 'manhattan'))
                    .toBe(expectedDistance);
            });
        });
    });

    describe('Minkowski Distance', () => {
        const pValues = [1, 2, 3, 4];

        testCases.forEach(({ p1, p2, label }) => {
            pValues.forEach(p => {
                test(`calculates correctly with p=${p} for ${label}`, () => {
                    const expectedDistance = Math.pow(
                        Math.pow(Math.abs(p2[0] - p1[0]), p) +
                        Math.pow(Math.abs(p2[1] - p1[1]), p),
                        1 / p
                    );
                    expect(calculateDistance(p1[0], p1[1], p2[0], p2[1], 'minkowski', p))
                        .toBeCloseTo(expectedDistance);
                });
            });

            test(`p=1 matches Manhattan for ${label}`, () => {
                const manhattan = calculateDistance(p1[0], p1[1], p2[0], p2[1], 'manhattan');
                const minkowskiP1 = calculateDistance(p1[0], p1[1], p2[0], p2[1], 'minkowski', 1);
                expect(minkowskiP1).toBeCloseTo(manhattan);
            });

            test(`p=2 matches Euclidean for ${label}`, () => {
                const euclidean = calculateDistance(p1[0], p1[1], p2[0], p2[1], 'euclidean');
                const minkowskiP2 = calculateDistance(p1[0], p1[1], p2[0], p2[1], 'minkowski', 2);
                expect(minkowskiP2).toBeCloseTo(euclidean);
            });
        });
    });

    describe('Hilbert Distance', () => {
        // Define some test dimensions
        const dimensions = [
            { width: 800, height: 600, label: '800x600 canvas' },
            { width: 1000, height: 1000, label: '1000x1000 canvas' }
        ];

        // Basic property tests
        test('distance from a point to itself is zero', () => {
            expect(calculateDistance(100, 100, 100, 100, 'hilbert', 2, 800, 600)).toBe(0);
        });

        test('distance is symmetric', () => {
            const dist1 = calculateDistance(100, 100, 200, 300, 'hilbert', 2, 800, 600);
            const dist2 = calculateDistance(200, 300, 100, 100, 'hilbert', 2, 800, 600);
            expect(dist1).toBeCloseTo(dist2);
        });

        test('distance is non-negative', () => {
            const dist = calculateDistance(100, 100, 200, 300, 'hilbert', 2, 800, 600);
            expect(dist).toBeGreaterThanOrEqual(0);
        });

        // Test for points on vertical and horizontal lines
        test('calculates correctly for horizontal line', () => {
            // Points on a horizontal line
            const dist = calculateDistance(200, 300, 600, 300, 'hilbert', 2, 800, 600);
            expect(dist).toBeGreaterThan(0);
        });

        test('calculates correctly for vertical line', () => {
            // Points on a vertical line
            const dist = calculateDistance(300, 100, 300, 500, 'hilbert', 2, 800, 600);
            expect(dist).toBeGreaterThan(0);
        });

        // Test for points on different parts of the canvas
        test('calculates correctly for points in different quadrants', () => {
            const dist = calculateDistance(100, 100, 700, 500, 'hilbert', 2, 800, 600);
            expect(dist).toBeGreaterThan(0);
        });

        // Test boundary cases
        test('handles points near the boundary', () => {
            const dist = calculateDistance(10, 10, 790, 590, 'hilbert', 2, 800, 600);
            expect(dist).toBeGreaterThan(0);
        });

        test('handles points on the boundary', () => {
            const dist = calculateDistance(0, 0, 800, 600, 'hilbert', 2, 800, 600);
            expect(dist).toBeGreaterThan(0);
        });

        // Check that the distance increases as points get further apart
        test('distance increases with point separation', () => {
            const dist1 = calculateDistance(400, 300, 500, 400, 'hilbert', 2, 800, 600);
            const dist2 = calculateDistance(400, 300, 600, 500, 'hilbert', 2, 800, 600);
            expect(dist2).toBeGreaterThan(dist1);
        });
    });
});

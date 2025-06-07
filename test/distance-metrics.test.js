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

        testCases.forEach(({ p1, p2, label: pointsLabel }) => {
            dimensions.forEach(({ width, height, label: dimLabel }) => {
                test(`calculates correctly for ${pointsLabel} on ${dimLabel}`, () => {
                    const dx = Math.abs(p2[0] - p1[0]);
                    const dy = Math.abs(p2[1] - p1[1]);
                    const expectedDistance = Math.max(dx / width, dy / height) * Math.min(width, height);

                    expect(calculateDistance(p1[0], p1[1], p2[0], p2[1], 'hilbert', 2, width, height))
                        .toBeCloseTo(expectedDistance);
                });
            });
        });

        test('produces expected results for simple cases', () => {
            // For a 800x600 canvas, and points at (0,0) and (80,60)
            // The scaled distances are 80/800 = 0.1 and 60/600 = 0.1
            // Max is 0.1, multiplied by min(800,600) = 60
            expect(calculateDistance(0, 0, 80, 60, 'hilbert', 2, 800, 600)).toBe(60);

            // For a 800x600 canvas, and points at (0,0) and (400,60)
            // The scaled distances are 400/800 = 0.5 and 60/600 = 0.1
            // Max is 0.5, multiplied by min(800,600) = 300
            expect(calculateDistance(0, 0, 400, 60, 'hilbert', 2, 800, 600)).toBe(300);
        });
    });
});

const {
    calculateDistance,
    getCentroid,
    createRegularPolygon,
    createCircleOfPoints,
    createRandomPoints,
    createGridOfPoints
} = require('../src/voronoi-core');

// Mock Math.random for predictable test results
const mockRandom = jest.spyOn(Math, 'random');

describe('Voronoi Core Functions', () => {
    // Reset Math.random mock after each test
    afterEach(() => {
        mockRandom.mockReset();
    });

    describe('Distance calculations', () => {
        test('calculates Euclidean distance correctly', () => {
            expect(calculateDistance(0, 0, 3, 4, 'euclidean')).toBe(5);
            expect(calculateDistance(1, 1, 4, 5, 'euclidean')).toBe(5);
            expect(calculateDistance(-1, -1, 2, 3, 'euclidean')).toBe(5);
        });

        test('calculates Manhattan distance correctly', () => {
            expect(calculateDistance(0, 0, 3, 4, 'manhattan')).toBe(7);
            expect(calculateDistance(1, 1, 4, 5, 'manhattan')).toBe(7);
            expect(calculateDistance(-1, -1, 2, 3, 'manhattan')).toBe(7);
        });

        test('calculates Minkowski distance correctly with various p values', () => {
            // p=1 should match Manhattan
            expect(calculateDistance(0, 0, 3, 4, 'minkowski', 1)).toBe(7);
            
            // p=2 should match Euclidean
            expect(calculateDistance(0, 0, 3, 4, 'minkowski', 2)).toBe(5);
            
            // Test with p=3
            const expectedP3 = Math.pow(Math.pow(3, 3) + Math.pow(4, 3), 1/3);
            expect(calculateDistance(0, 0, 3, 4, 'minkowski', 3)).toBeCloseTo(expectedP3, 5);
        });

        test('calculates Hilbert distance correctly', () => {
            // In a 800x600 canvas, the Hilbert distance for points (0,0) and (80,60)
            // would be max(80/800, 60/600) * min(800, 600) = 0.1 * 600 = 60
            expect(calculateDistance(0, 0, 80, 60, 'hilbert', 2, 800, 600)).toBe(60);
            
            // Test with points that have different max ratio
            expect(calculateDistance(0, 0, 400, 60, 'hilbert', 2, 800, 600)).toBe(300);
        });
    });

    describe('Centroid calculation', () => {
        test('calculates centroid correctly for a triangle', () => {
            const points = [[0, 0], [3, 0], [0, 3]];
            const centroid = getCentroid(points);
            expect(centroid[0]).toBe(1); // x = (0+3+0)/3 = 1
            expect(centroid[1]).toBe(1); // y = (0+0+3)/3 = 1
        });

        test('calculates centroid correctly for a square', () => {
            const points = [[0, 0], [2, 0], [2, 2], [0, 2]];
            const centroid = getCentroid(points);
            expect(centroid[0]).toBe(1); // x = (0+2+2+0)/4 = 1
            expect(centroid[1]).toBe(1); // y = (0+0+2+2)/4 = 1
        });
    });

    describe('Shape generation', () => {
        test('creates regular polygon points correctly', () => {
            // Test triangle (3 sides)
            const triangle = createRegularPolygon(3, 100, 800, 600);
            expect(triangle.length).toBe(3);
            
            // The points should form an equilateral triangle
            // Just verify the basic structure here
            triangle.forEach(point => {
                expect(point).toHaveProperty('x');
                expect(point).toHaveProperty('y');
            });
            
            // Test pentagon (5 sides)
            const pentagon = createRegularPolygon(5, 100, 800, 600);
            expect(pentagon.length).toBe(5);
        });

        test('creates circular arrangement of points correctly', () => {
            const circlePoints = createCircleOfPoints(6, 100, 800, 600);
            expect(circlePoints.length).toBe(6);
            
            // All points should be roughly the same distance from center
            const centerX = 800 / 2;
            const centerY = 600 / 2;
            
            circlePoints.forEach(point => {
                const distance = Math.sqrt(
                    Math.pow(point.x - centerX, 2) + 
                    Math.pow(point.y - centerY, 2)
                );
                expect(distance).toBeCloseTo(100, 0);
            });
        });

        test('creates random points correctly', () => {
            // Mock Math.random to return predictable values
            mockRandom
                .mockReturnValueOnce(0.5) // x for point 1
                .mockReturnValueOnce(0.5) // y for point 1
                .mockReturnValueOnce(0.25) // x for point 2
                .mockReturnValueOnce(0.75); // y for point 2
            
            const randomPoints = createRandomPoints(2, 800, 600);
            expect(randomPoints.length).toBe(2);
            
            // Check that the random values were used correctly (accounting for margins)
            // Margin is 10% of width/height = 80, 60
            // Available space is 800 - 2*80 = 640 for width, 600 - 2*60 = 480 for height
            expect(randomPoints[0].x).toBeCloseTo(80 + 0.5 * 640, 0);
            expect(randomPoints[0].y).toBeCloseTo(60 + 0.5 * 480, 0);
            expect(randomPoints[1].x).toBeCloseTo(80 + 0.25 * 640, 0);
            expect(randomPoints[1].y).toBeCloseTo(60 + 0.75 * 480, 0);
        });

        test('creates grid of points correctly', () => {
            const grid = createGridOfPoints(2, 3, 800, 600);
            expect(grid.length).toBe(6); // 2 rows × 3 columns = 6 points
            
            // Check that the points form a proper grid
            // This is a simplistic check that verifies we have the right number
            // of unique x and y coordinates
            const uniqueX = new Set(grid.map(p => p.x));
            const uniqueY = new Set(grid.map(p => p.y));
            
            expect(uniqueX.size).toBe(3); // 3 columns should have 3 unique x values
            expect(uniqueY.size).toBe(2); // 2 rows should have 2 unique y values
        });
    });
});

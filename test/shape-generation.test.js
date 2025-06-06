/**
 * Tests for shape generation functions in the Voronoi diagram application
 */

const {
  createRegularPolygon,
  createCircleOfPoints,
  createRandomPoints,
  createGridOfPoints
} = require('../src/voronoi-core');

// Mock Math.random for predictable test results
const mockRandom = jest.spyOn(Math, 'random');

describe('Shape Generation Functions', () => {
  // Reset Math.random mock after each test
  afterEach(() => {
    mockRandom.mockReset();
  });
  
  describe('Regular Polygon Generation', () => {
    test('generates triangles with proper angles', () => {
      const sides = 3;
      const radius = 100;
      const width = 800;
      const height = 600;
      
      const triangle = createRegularPolygon(sides, radius, width, height);
      expect(triangle).toHaveLength(sides);
      
      // Calculate the expected angle between adjacent points (120° for triangle)
      const expectedAngle = 2 * Math.PI / sides;
      
      // Center of the canvas
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Calculate angles between consecutive points relative to center
      for (let i = 0; i < sides; i++) {
        const point1 = triangle[i];
        const point2 = triangle[(i + 1) % sides];
        
        // Calculate vectors from center to each point
        const v1x = point1.x - centerX;
        const v1y = point1.y - centerY;
        const v2x = point2.x - centerX;
        const v2y = point2.y - centerY;
        
        // Calculate the angle between the vectors (using dot product)
        const dotProduct = v1x * v2x + v1y * v2y;
        const magnitude1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const magnitude2 = Math.sqrt(v2x * v2x + v2y * v2y);
        
        // Angle in radians
        const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
        
        // Should be close to expectedAngle (tolerate small floating point errors)
        expect(angle).toBeCloseTo(expectedAngle, 5);
      }
    });
    
    test('generates square with proper angles', () => {
      const sides = 4;
      const radius = 100;
      
      const square = createRegularPolygon(sides, radius);
      expect(square).toHaveLength(sides);
      
      // Square should have 90-degree angles (π/2 radians)
      const expectedAngle = Math.PI / 2;
      
      // Default center
      const centerX = 800 / 2;
      const centerY = 600 / 2;
      
      for (let i = 0; i < sides; i++) {
        const point1 = square[i];
        const point2 = square[(i + 1) % sides];
        const point3 = square[(i + 2) % sides];
        
        // Calculate vectors from point1 to point2 and point3 to point2
        const v1x = point1.x - point2.x;
        const v1y = point1.y - point2.y;
        const v2x = point3.x - point2.x;
        const v2y = point3.y - point2.y;
        
        // Calculate the angle between the vectors
        const dotProduct = v1x * v2x + v1y * v2y;
        const magnitude1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const magnitude2 = Math.sqrt(v2x * v2x + v2y * v2y);
        
        // Angle in radians (adjacent sides should be perpendicular)
        const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
        
        expect(angle).toBeCloseTo(expectedAngle, 5);
      }
    });
    
    test('generates dodecagon with correct number of sides', () => {
      const sides = 12;
      const radius = 100;
      
      const dodecagon = createRegularPolygon(sides, radius);
      expect(dodecagon).toHaveLength(sides);
      
      // Each point should be the same distance from center
      const centerX = 800 / 2;
      const centerY = 600 / 2;
      
      dodecagon.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        expect(distance).toBeCloseTo(radius, 5);
      });
    });
  });
  
  describe('Circle Point Generation', () => {
    test('generates points at equal distances from center', () => {
      const count = 8;
      const radius = 150;
      
      const circlePoints = createCircleOfPoints(count, radius);
      expect(circlePoints).toHaveLength(count);
      
      // Default center
      const centerX = 800 / 2;
      const centerY = 600 / 2;
      
      circlePoints.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        expect(distance).toBeCloseTo(radius, 5);
      });
    });
    
    test('points are equally spaced around the circle', () => {
      const count = 6;
      const radius = 100;
      
      const circlePoints = createCircleOfPoints(count, radius);
      
      // Angle between adjacent points should be 2π/count
      const expectedAngle = 2 * Math.PI / count;
      
      // Default center
      const centerX = 800 / 2;
      const centerY = 600 / 2;
      
      for (let i = 0; i < count; i++) {
        const point1 = circlePoints[i];
        const point2 = circlePoints[(i + 1) % count];
        
        // Calculate vectors from center to each point
        const v1x = point1.x - centerX;
        const v1y = point1.y - centerY;
        const v2x = point2.x - centerX;
        const v2y = point2.y - centerY;
        
        // Calculate the angle between the vectors
        const dotProduct = v1x * v2x + v1y * v2y;
        const magnitude1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const magnitude2 = Math.sqrt(v2x * v2x + v2y * v2y);
        
        const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
        expect(angle).toBeCloseTo(expectedAngle, 5);
      }
    });
  });
  
  describe('Random Point Generation', () => {
    test('generates the requested number of random points', () => {
      // Mock random values
      for (let i = 0; i < 20; i++) {
        mockRandom.mockReturnValueOnce(0.5);
      }
      
      const count = 10;
      const randomPoints = createRandomPoints(count);
      expect(randomPoints).toHaveLength(count);
    });
    
    test('points are within the margin boundaries', () => {
      // Different random values for x and y
      for (let i = 0; i < 10; i++) {
        mockRandom
          .mockReturnValueOnce(i * 0.1) // x values from 0 to 0.9
          .mockReturnValueOnce(1 - i * 0.1); // y values from 1.0 to 0.1
      }
      
      const width = 1000;
      const height = 800;
      const marginX = width * 0.1;
      const marginY = height * 0.1;
      
      const randomPoints = createRandomPoints(10, width, height);
      
      randomPoints.forEach((point, i) => {
        // Check x-coordinate
        expect(point.x).toBeGreaterThanOrEqual(marginX);
        expect(point.x).toBeLessThanOrEqual(width - marginX);
        
        // Check y-coordinate
        expect(point.y).toBeGreaterThanOrEqual(marginY);
        expect(point.y).toBeLessThanOrEqual(height - marginY);
      });
    });
  });
  
  describe('Grid Point Generation', () => {
    test('generates a grid with the correct dimensions', () => {
      const rows = 3;
      const cols = 4;
      
      const gridPoints = createGridOfPoints(rows, cols);
      expect(gridPoints).toHaveLength(rows * cols);
      
      // Check that we have the right number of distinct x and y coordinates
      const uniqueX = new Set(gridPoints.map(p => p.x));
      const uniqueY = new Set(gridPoints.map(p => p.y));
      
      expect(uniqueX.size).toBe(cols);
      expect(uniqueY.size).toBe(rows);
    });
    
    test('grid points are evenly spaced', () => {
      const rows = 2;
      const cols = 3;
      const width = 1000;
      const height = 800;
      
      const gridPoints = createGridOfPoints(rows, cols, width, height);
      
      // Sort points by y, then by x to get a predictable order
      gridPoints.sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return a.y - b.y;
      });
      
      // Check horizontal spacing in the first row
      const xSpacing = gridPoints[1].x - gridPoints[0].x;
      expect(gridPoints[2].x - gridPoints[1].x).toBeCloseTo(xSpacing, 5);
      
      // Check vertical spacing
      const ySpacing = gridPoints[cols].y - gridPoints[0].y;
      expect(gridPoints[cols + 1].y - gridPoints[1].y).toBeCloseTo(ySpacing, 5);
    });
    
    test('grid has proper margins', () => {
      const rows = 2;
      const cols = 2;
      const width = 1000;
      const height = 800;
      const marginX = width * 0.15;
      const marginY = height * 0.15;
      
      const gridPoints = createGridOfPoints(rows, cols, width, height);
      
      // Sort points
      gridPoints.sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return a.y - b.y;
      });
      
      // First point should be at margin
      expect(gridPoints[0].x).toBeCloseTo(marginX, 5);
      expect(gridPoints[0].y).toBeCloseTo(marginY, 5);
      
      // Last point should be at (width - margin, height - margin)
      expect(gridPoints[3].x).toBeCloseTo(width - marginX, 5);
      expect(gridPoints[3].y).toBeCloseTo(height - marginY, 5);
    });
  });
});

/**
 * Voronoi Diagram Core Functions
 * This module contains the core functions for the Voronoi diagram application
 * extracted to be testable with Jest.
 */

// Constants for the default canvas size (can be overridden)
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

/**
 * Calculate distance between two points based on the selected distance metric
 *
 * @param {number} x1 - X coordinate of the first point
 * @param {number} y1 - Y coordinate of the first point
 * @param {number} x2 - X coordinate of the second point
 * @param {number} y2 - Y coordinate of the second point
 * @param {string} distanceMetric - The metric to use ('euclidean', 'manhattan', 'minkowski', or 'hilbert')
 * @param {number} pValue - The p-value for Minkowski distance (default: 2)
 * @param {number} width - Width of the canvas (for Hilbert metric)
 * @param {number} height - Height of the canvas (for Hilbert metric)
 * @returns {number} - The calculated distance
 */
function calculateDistance(x1, y1, x2, y2, distanceMetric = 'euclidean', pValue = 2, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    switch(distanceMetric) {
        case 'manhattan':
            return Math.abs(x1 - x2) + Math.abs(y1 - y2);
        case 'euclidean':
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        case 'minkowski':
            return Math.pow(
                Math.pow(Math.abs(x1 - x2), pValue) +
                Math.pow(Math.abs(y1 - y2), pValue),
                1 / pValue
            );
        case 'hilbert':
            // Hilbert metric calculation
            // For two points P1(x1,y1) and P2(x2,y2), we need to:
            // 1. Find the line through P1 and P2
            // 2. Find where this line intersects the boundary (B1 and B2)
            // 3. Calculate the cross-ratio and take ln of it

            // If points are the same, distance is 0
            if (x1 === x2 && y1 === y2) return 0;
            
            // Find the line equation: y = mx + b
            const m = (y2 - y1) / (x2 - x1 || 0.000001); // Avoid division by zero
            const b = y1 - m * x1;
            
            // Find intersections with the canvas boundary
            const intersections = [];
            
            // Left boundary: x = 0
            const leftY = b;
            if (leftY >= 0 && leftY <= height) {
                intersections.push([0, leftY]);
            }
            
            // Right boundary: x = width
            const rightY = m * width + b;
            if (rightY >= 0 && rightY <= height) {
                intersections.push([width, rightY]);
            }
            
            // Top boundary: y = 0
            const topX = -b / m;
            if (topX >= 0 && topX <= width) {
                intersections.push([topX, 0]);
            }
            
            // Bottom boundary: y = height
            const bottomX = (height - b) / m;
            if (bottomX >= 0 && bottomX <= width) {
                intersections.push([bottomX, height]);
            }
            
            // If we don't have at least 2 intersections, return Euclidean distance
            if (intersections.length < 2) {
                return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            }
            
            // Sort intersections by distance from P1 to determine B1 and B2
            intersections.sort((a, b) => {
                const distA = Math.sqrt(Math.pow(a[0] - x1, 2) + Math.pow(a[1] - y1, 2));
                const distB = Math.sqrt(Math.pow(b[0] - x1, 2) + Math.pow(b[1] - y1, 2));
                return distA - distB;
            });
            
            // We need to sort intersections based on the line through P1 and P2
            // Let's compute the vector from P1 to P2
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Unit vector in direction of the line
            const unitDx = dx / dist;
            const unitDy = dy / dist;
            
            // Sort intersections by projection onto the line through P1 and P2
            intersections.sort((a, b) => {
                // Project vector from P1 to intersection point onto unit direction vector
                const projA = (a[0] - x1) * unitDx + (a[1] - y1) * unitDy;
                const projB = (b[0] - x1) * unitDx + (b[1] - y1) * unitDy;
                return projA - projB;
            });
            
            // B1 is the leftmost intersection, B2 is the rightmost
            const [b1x, b1y] = intersections[0];
            const [b2x, b2y] = intersections[intersections.length - 1];
            
            // Calculate Euclidean distances
            const D11 = Math.sqrt(Math.pow(x1 - b1x, 2) + Math.pow(y1 - b1y, 2)); // P1 to B1
            const D12 = Math.sqrt(Math.pow(x1 - b2x, 2) + Math.pow(y1 - b2y, 2)); // P1 to B2
            const D21 = Math.sqrt(Math.pow(x2 - b1x, 2) + Math.pow(y2 - b1y, 2)); // P2 to B1
            const D22 = Math.sqrt(Math.pow(x2 - b2x, 2) + Math.pow(y2 - b2y, 2)); // P2 to B2
            
            // Check to make sure none of the distances are zero (which would happen if a point is on the boundary)
            if (D11 === 0 || D12 === 0 || D21 === 0 || D22 === 0) {
                // Fall back to Euclidean distance
                return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            }
            
            // Calculate Hilbert distance: 0.5 * ln((D12/D22) * (D21/D11))
            // Use absolute value to ensure the result is positive
            return Math.abs(0.5 * Math.log((D12 / D22) * (D21 / D11)));
        default:
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
}

/**
 * Calculate the centroid of a polygon
 *
 * @param {Array} points - Array of points, each point as [x, y]
 * @returns {Array} - The centroid as [x, y]
 */
function getCentroid(points) {
    let x = 0;
    let y = 0;

    points.forEach(p => {
        x += p[0];
        y += p[1];
    });

    return [x / points.length, y / points.length];
}

/**
 * Generate points in a regular polygon shape
 *
 * @param {number} sides - Number of sides for the polygon
 * @param {number} radius - Radius of the circumscribed circle
 * @param {number} width - Canvas width (default: 800)
 * @param {number} height - Canvas height (default: 600)
 * @returns {Array} - Array of point objects { x, y }
 */
function createRegularPolygon(sides, radius, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = 2 * Math.PI / sides;
    const newPoints = [];

    // Start from the top (270 degrees or -90 degrees)
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < sides; i++) {
        const x = centerX + radius * Math.cos(startAngle + i * angle);
        const y = centerY + radius * Math.sin(startAngle + i * angle);
        newPoints.push({ x, y });
    }

    return newPoints;
}

/**
 * Generate points in a circular arrangement
 *
 * @param {number} count - Number of points
 * @param {number} radius - Radius of the circle
 * @param {number} width - Canvas width (default: 800)
 * @param {number} height - Canvas height (default: 600)
 * @returns {Array} - Array of point objects { x, y }
 */
function createCircleOfPoints(count, radius, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = 2 * Math.PI / count;
    const newPoints = [];

    for (let i = 0; i < count; i++) {
        const x = centerX + radius * Math.cos(i * angle);
        const y = centerY + radius * Math.sin(i * angle);
        newPoints.push({ x, y });
    }

    return newPoints;
}

/**
 * Generate random points
 *
 * @param {number} count - Number of points to generate
 * @param {number} width - Canvas width (default: 800)
 * @param {number} height - Canvas height (default: 600)
 * @returns {Array} - Array of point objects { x, y }
 */
function createRandomPoints(count, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    const marginX = width * 0.1;
    const marginY = height * 0.1;
    const newPoints = [];

    for (let i = 0; i < count; i++) {
        const x = marginX + Math.random() * (width - 2 * marginX);
        const y = marginY + Math.random() * (height - 2 * marginY);
        newPoints.push({ x, y });
    }

    return newPoints;
}

/**
 * Create a grid of points
 *
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {number} width - Canvas width (default: 800)
 * @param {number} height - Canvas height (default: 600)
 * @returns {Array} - Array of point objects { x, y }
 */
function createGridOfPoints(rows, cols, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    const marginX = width * 0.15;
    const marginY = height * 0.15;
    const newPoints = [];

    const cellWidth = (width - 2 * marginX) / (cols - 1);
    const cellHeight = (height - 2 * marginY) / (rows - 1);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = marginX + j * cellWidth;
            const y = marginY + i * cellHeight;
            newPoints.push({ x, y });
        }
    }

    return newPoints;
}

// Export the functions for use in tests and in the main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateDistance,
        getCentroid,
        createRegularPolygon,
        createCircleOfPoints,
        createRandomPoints,
        createGridOfPoints
    };
}

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
            // Hilbert metric (maximum of the ratios)
            const dx = Math.abs(x1 - x2);
            const dy = Math.abs(y1 - y2);
            return Math.max(dx / width, dy / height) * Math.min(width, height);
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

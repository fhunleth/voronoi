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
            // For points in a rectangle, the Hilbert distance is a projective metric
            // that approaches infinity as points get closer to the boundary.

            // If points are the same, distance is 0
            if (x1 === x2 && y1 === y2) return 0;

            // First compute how close each point is to the boundary
            // The closer to the boundary, the larger the distance should be

            // Normalized coordinates (from 0 to 1)
            const nx1 = x1 / width;
            const ny1 = y1 / height;
            const nx2 = x2 / width;
            const ny2 = y2 / height;

            // Distance to each boundary for each point
            const d1Left = nx1;                  // distance from P1 to left edge
            const d1Right = 1 - nx1;             // distance from P1 to right edge
            const d1Top = ny1;                   // distance from P1 to top edge
            const d1Bottom = 1 - ny1;            // distance from P1 to bottom edge
            const d1Min = Math.min(d1Left, d1Right, d1Top, d1Bottom);  // closest boundary

            const d2Left = nx2;                  // distance from P2 to left edge
            const d2Right = 1 - nx2;             // distance from P2 to right edge
            const d2Top = ny2;                   // distance from P2 to top edge
            const d2Bottom = 1 - ny2;            // distance from P2 to bottom edge
            const d2Min = Math.min(d2Left, d2Right, d2Top, d2Bottom);  // closest boundary

            // The Hilbert metric should go to infinity as points get closer to the boundary
            // We'll compute it based on the standard cross-ratio formula

            // Find the line through the points
            const m = (ny2 - ny1) / ((nx2 - nx1) || 0.000001); // slope with division-by-zero protection
            const b = ny1 - m * nx1;  // y-intercept

            // Find where this line intersects the unit square boundaries (in normalized coords)
            const intersections = [];

            // Left boundary (x = 0)
            if (b >= 0 && b <= 1) {
                intersections.push([0, b]);
            }

            // Right boundary (x = 1)
            const rightY = m + b;
            if (rightY >= 0 && rightY <= 1) {
                intersections.push([1, rightY]);
            }

            // Top boundary (y = 0)
            if (Math.abs(m) > 0.000001) { // avoid division by near-zero
                const topX = -b / m;
                if (topX >= 0 && topX <= 1) {
                    intersections.push([topX, 0]);
                }
            }

            // Bottom boundary (y = 1)
            if (Math.abs(m) > 0.000001) { // avoid division by near-zero
                const bottomX = (1 - b) / m;
                if (bottomX >= 0 && bottomX <= 1) {
                    intersections.push([bottomX, 1]);
                }
            }

            // If we don't have at least 2 intersections, the line doesn't cross the square
            // In this case, use a different approach
            if (intersections.length < 2) {
                // Use scaled Euclidean distance and scale it based on proximity to boundary
                const euclideanDist = Math.sqrt(
                    Math.pow(nx2 - nx1, 2) + Math.pow(ny2 - ny1, 2)
                );
                const boundaryFactor = 1 / (Math.min(d1Min, d2Min) + 0.01);
                return euclideanDist * boundaryFactor * Math.min(width, height);
            }

            // Compute the projection vector (direction of the line)
            const dx = nx2 - nx1;
            const dy = ny2 - ny1;
            const lineDist = Math.sqrt(dx * dx + dy * dy);
            const dirX = dx / lineDist;
            const dirY = dy / lineDist;

            // Sort intersections by their projection onto the line
            intersections.sort((a, b) => {
                const projA = (a[0] - nx1) * dirX + (a[1] - ny1) * dirY;
                const projB = (b[0] - nx1) * dirX + (b[1] - ny1) * dirY;
                return projA - projB;
            });

            // We need the two intersections that bracket our points on the line
            const B1 = intersections[0];              // First intersection
            const B2 = intersections[intersections.length - 1]; // Last intersection

            // Calculate distances (in normalized coordinates)
            const D11 = Math.sqrt(Math.pow(nx1 - B1[0], 2) + Math.pow(ny1 - B1[1], 2)); // P1 to B1
            const D12 = Math.sqrt(Math.pow(nx1 - B2[0], 2) + Math.pow(ny1 - B2[1], 2)); // P1 to B2
            const D21 = Math.sqrt(Math.pow(nx2 - B1[0], 2) + Math.pow(ny2 - B1[1], 2)); // P2 to B1
            const D22 = Math.sqrt(Math.pow(nx2 - B2[0], 2) + Math.pow(ny2 - B2[1], 2)); // P2 to B2

            // Handle small distances that could cause numeric issues
            const epsilon = 0.000001;
            if (D11 < epsilon || D12 < epsilon || D21 < epsilon || D22 < epsilon) {
                // If a point is very close to the boundary, the distance should be very large
                return 100000 / (Math.min(D11, D12, D21, D22) + epsilon);
            }

            // Hilbert distance formula: 0.5 * ln((D12/D22) * (D21/D11))
            // This is the cross-ratio formula
            const crossRatio = (D12 * D21) / (D22 * D11);
            const hilbertDist = 0.5 * Math.abs(Math.log(crossRatio));

            // Scale back to original coordinate space
            const scaleFactor = Math.min(width, height);
            return hilbertDist * scaleFactor;
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

/**
 * Tests for the distance display feature in the Voronoi diagram application
 */

const { calculateDistance } = require('../src/voronoi-core');

// Mock DOM environment
let svgElement;
let distanceContainer;
let showDistancesCheckbox;

describe('Distance Display Tests', () => {
    beforeEach(() => {
        // Create mock elements
        svgElement = {
            getBoundingClientRect: jest.fn(() => ({
                left: 0,
                top: 0,
                width: 800,
                height: 600
            })),
            addEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        };

        showDistancesCheckbox = {
            checked: false,
            showDistances: false,
            addEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        };

        distanceContainer = {
            style: { display: 'none' },
            html: jest.fn()
        };
    });

    afterEach(() => {
        // Clean up
        jest.restoreAllMocks();
    });

    describe('Distance Toggle Functionality', () => {
        test('initially distance display should be hidden', () => {
            expect(showDistancesCheckbox.checked).toBeFalsy();
            expect(distanceContainer.style.display).toBe('none');
        });

        test('toggling checkbox should update showDistances state', () => {
            // Create a test function that mimics the event handler
            const toggleShowDistances = jest.fn(() => {
                showDistancesCheckbox.showDistances = showDistancesCheckbox.checked;
                if (!showDistancesCheckbox.showDistances) {
                    distanceContainer.style.display = 'none';
                }
            });

            // Initially it should be off
            expect(showDistancesCheckbox.checked).toBeFalsy();

            // Attach the event handler and trigger a change event
            showDistancesCheckbox.addEventListener('change', toggleShowDistances);
            showDistancesCheckbox.checked = true;
            showDistancesCheckbox.dispatchEvent(new window.Event('change'));

            // Function should have been called
            expect(toggleShowDistances).toHaveBeenCalled();
            expect(showDistancesCheckbox.showDistances).toBeTruthy();

            // Toggle off
            showDistancesCheckbox.checked = false;
            showDistancesCheckbox.dispatchEvent(new window.Event('change'));

            // State should update and overlay should hide
            expect(showDistancesCheckbox.showDistances).toBeFalsy();
            expect(distanceContainer.style.display).toBe('none');
        });
    });

    describe('Distance Display Calculations', () => {
        let points;
        let updateDistanceDisplay;

        beforeEach(() => {
            // Set up test points
            points = [
                { x: 100, y: 100 },  // Point 1
                { x: 300, y: 200 },  // Point 2
                { x: 500, y: 400 }   // Point 3
            ];

            // Mock distance calculations function similar to the one in script.js
            updateDistanceDisplay = (mouseX, mouseY, points, distanceMetric = 'euclidean', pValue = 2) => {
                // Calculate distances to each point
                const distances = points.map((point, index) => {
                    const dist = calculateDistance(
                        mouseX, mouseY, point.x, point.y,
                        distanceMetric, pValue, 800, 600
                    );
                    return {
                        pointIndex: index + 1,
                        distance: dist,
                        color: `color-${index}` // Simplified mock of color function
                    };
                });

                // Sort by distance (closest first)
                distances.sort((a, b) => a.distance - b.distance);

                return distances;
            };

            // Mock display updating
            distanceContainer.html = jest.fn();
        });

        test('calculates correct distances from mouse to points', () => {
            const mouseX = 200;
            const mouseY = 150;
            const distanceMetric = 'euclidean';

            const distances = updateDistanceDisplay(mouseX, mouseY, points, distanceMetric);

            // Calculate expected distances
            const expected = [
                {
                    pointIndex: 1,
                    distance: calculateDistance(mouseX, mouseY, points[0].x, points[0].y, distanceMetric),
                    color: 'color-0'
                },
                {
                    pointIndex: 2,
                    distance: calculateDistance(mouseX, mouseY, points[1].x, points[1].y, distanceMetric),
                    color: 'color-1'
                },
                {
                    pointIndex: 3,
                    distance: calculateDistance(mouseX, mouseY, points[2].x, points[2].y, distanceMetric),
                    color: 'color-2'
                }
            ];
            expected.sort((a, b) => a.distance - b.distance);

            // First point should be closest
            expect(distances[0].pointIndex).toBe(expected[0].pointIndex);
            expect(distances[0].distance).toBeCloseTo(expected[0].distance);

            // Check all distances
            for (let i = 0; i < distances.length; i++) {
                expect(distances[i].pointIndex).toBe(expected[i].pointIndex);
                expect(distances[i].distance).toBeCloseTo(expected[i].distance);
            }
        });

        test('sorts distances correctly (closest first)', () => {
            const mouseX = 400;
            const mouseY = 300;

            const distances = updateDistanceDisplay(mouseX, mouseY, points, 'euclidean');

            // With these coordinates, Point 2 should be closest, then Point 3, then Point 1
            expect(distances[0].pointIndex).toBe(2); // Point 2 is closest
            expect(distances[1].pointIndex).toBe(3); // Point 3 is second
            expect(distances[2].pointIndex).toBe(1); // Point 1 is furthest

            // Verify the distances are in ascending order
            expect(distances[0].distance).toBeLessThan(distances[1].distance);
            expect(distances[1].distance).toBeLessThan(distances[2].distance);
        });

        test('handles different distance metrics correctly', () => {
            const mouseX = 200;
            const mouseY = 150;

            // Test with Manhattan distance
            const manhattanDistances = updateDistanceDisplay(mouseX, mouseY, points, 'manhattan');

            // Calculate expected Manhattan distances
            const expectedManhattan = points.map((point, idx) => ({
                pointIndex: idx + 1,
                distance: Math.abs(mouseX - point.x) + Math.abs(mouseY - point.y),
                color: `color-${idx}`
            })).sort((a, b) => a.distance - b.distance);

            // Verify all distances
            for (let i = 0; i < manhattanDistances.length; i++) {
                expect(manhattanDistances[i].distance).toBeCloseTo(expectedManhattan[i].distance);
                expect(manhattanDistances[i].pointIndex).toBe(expectedManhattan[i].pointIndex);
            }

            // Test with Minkowski p=3 distance
            const minkowskiDistances = updateDistanceDisplay(mouseX, mouseY, points, 'minkowski', 3);

            // Calculate expected Minkowski distances
            const expectedMinkowski = points.map((point, idx) => {
                const dx = Math.abs(mouseX - point.x);
                const dy = Math.abs(mouseY - point.y);
                const dist = Math.pow(Math.pow(dx, 3) + Math.pow(dy, 3), 1/3);
                return {
                    pointIndex: idx + 1,
                    distance: dist,
                    color: `color-${idx}`
                };
            }).sort((a, b) => a.distance - b.distance);

            // Verify all distances
            for (let i = 0; i < minkowskiDistances.length; i++) {
                expect(minkowskiDistances[i].distance).toBeCloseTo(expectedMinkowski[i].distance);
                expect(minkowskiDistances[i].pointIndex).toBe(expectedMinkowski[i].pointIndex);
            }
        });
    });

    describe('Mouse Interaction', () => {
        let points;
        let updateDistanceDisplay;

        beforeEach(() => {
            points = [{ x: 100, y: 100 }, { x: 300, y: 200 }];

            // Simple mock for updating the display
            updateDistanceDisplay = jest.fn();

            // Set up neccesary global variables for tests
            window.showDistances = false;
            window.points = points;
        });

        test('mousemove should not update display when showDistances is false', () => {
            const mouseMoveHandler = (event) => {
                if (!window.showDistances || window.points.length === 0) {
                    return;
                }

                // If showing distances, this would update the overlay
                updateDistanceDisplay();
            };

            svgElement.addEventListener('mousemove', mouseMoveHandler);

            // When showDistances is false
            window.showDistances = false;

            // Simulate mouse movement
            const mouseEvent = new window.MouseEvent('mousemove', {
                clientX: 200,
                clientY: 150
            });

            svgElement.dispatchEvent(mouseEvent);

            // The update function should not be called
            expect(updateDistanceDisplay).not.toHaveBeenCalled();
        });

        test('mousemove should update display when showDistances is true', () => {
            const mouseMoveHandler = (event) => {
                if (!window.showDistances || window.points.length === 0) {
                    return;
                }

                // If showing distances, this would update the overlay
                updateDistanceDisplay();
            };

            svgElement.addEventListener('mousemove', mouseMoveHandler);

            // When showDistances is true
            window.showDistances = true;

            // Simulate mouse movement
            const mouseEvent = new window.MouseEvent('mousemove', {
                clientX: 200,
                clientY: 150
            });

            svgElement.dispatchEvent(mouseEvent);

            // The update function should be called
            expect(updateDistanceDisplay).toHaveBeenCalled();
        });

        test('mouseleave should hide the distance overlay', () => {
            const mouseLeaveHandler = () => {
                distanceContainer.style.display = 'none';
            };

            svgElement.addEventListener('mouseleave', mouseLeaveHandler);

            // First make sure the overlay is visible
            distanceContainer.style.display = 'block';

            // Simulate mouse leaving the SVG element
            const mouseLeaveEvent = new window.Event('mouseleave');
            svgElement.dispatchEvent(mouseLeaveEvent);

            // The overlay should be hidden
            expect(distanceContainer.style.display).toBe('none');
        });
    });
});

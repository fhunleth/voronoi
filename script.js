document.addEventListener('DOMContentLoaded', function() {
    // Set current year in the footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Canvas setup
    const svgElement = document.getElementById('voronoi-canvas');
    const svgRect = svgElement.getBoundingClientRect();
    const width = svgRect.width;
    const height = svgRect.height;
    
    // Initialize D3 SVG
    const svg = d3.select('#voronoi-canvas')
        .attr('width', width)
        .attr('height', height);
    
    // State variables
    let points = [];
    let distanceMetric = "euclidean"; // Default distance metric
    let pValue = 2; // Default p-value for Minkowski distance
    let voronoiOrder = 1; // Default to standard (first-order) Voronoi diagram

    // Create group elements for cells and points
    const cellsGroup = svg.append('g').attr('class', 'cells');
    const pointsGroup = svg.append('g').attr('class', 'points');
    
    // Initialize the UI
    updatePValueVisibility();
    
    // Get the current settings
    function getSettings() {
        distanceMetric = document.getElementById('distance-metric').value;
        pValue = parseInt(document.getElementById('p-value').value, 10);
        voronoiOrder = parseInt(document.getElementById('order').value, 10);
    }
    
    // Toggle P-value input visibility based on selected distance metric
    function updatePValueVisibility() {
        const pValueContainer = document.getElementById('p-value-container');
        pValueContainer.style.display = document.getElementById('distance-metric').value === 'minkowski' ? 'block' : 'none';
    }
    
    // Update the Voronoi diagram
    function updateVoronoi() {
        // Clear existing cells and points
        cellsGroup.selectAll('*').remove();
        pointsGroup.selectAll('*').remove();
        
        // Update points count
        document.getElementById('points-count').textContent = `Points: ${points.length}`;
        
        // Update max order based on number of points
        updateMaxOrder();
        
        // Get current settings
        getSettings();
        
        // If fewer than 3 points, just render the points
        if (points.length < 3) {
            renderPoints();
            return;
        }
        
        // Generate Voronoi diagram
        if (voronoiOrder === 1) {
            // For standard first-order Voronoi, use distance-based approach
            generateFirstOrderVoronoi();
        } else {
            // For higher-order Voronoi diagrams
            generateHigherOrderVoronoi();
        }
    }
    
    // Update the max Voronoi order based on the number of points
    function updateMaxOrder() {
        const orderInput = document.getElementById('order');
        const maxOrder = Math.max(1, points.length - 1);
        
        // Update the max attribute
        orderInput.max = maxOrder;
        
        // If current value exceeds max, adjust it
        if (parseInt(orderInput.value, 10) > maxOrder) {
            orderInput.value = maxOrder;
        }
    }
    
    // Calculate distance between two points based on the selected distance metric
    function calculateDistance(x1, y1, x2, y2) {
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
            default:
                return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
    }
    
    // Generate standard (first-order) Voronoi diagram
    function generateFirstOrderVoronoi() {
        // First, render the points
        renderPoints();
        
        // Create a grid of sample points to test distances
        const resolution = 2; // Pixels between sample points
        const cellData = [];
        
        for (let x = 0; x < width; x += resolution) {
            for (let y = 0; y < height; y += resolution) {
                // For each pixel, find the closest site
                let minDist = Infinity;
                let closestPoint = null;
                
                points.forEach((point, index) => {
                    // Use the selected distance metric
                    const dist = calculateDistance(point.x, point.y, x, y);
                    
                    if (dist < minDist) {
                        minDist = dist;
                        closestPoint = index;
                    }
                });
                
                if (closestPoint !== null) {
                    // Add this pixel to the cell data
                    cellData.push({
                        x: x,
                        y: y,
                        pointIndex: closestPoint
                    });
                }
            }
        }
        
        // Group the pixels by their closest point
        const cellsByPoint = {};
        cellData.forEach(pixel => {
            if (!cellsByPoint[pixel.pointIndex]) {
                cellsByPoint[pixel.pointIndex] = [];
            }
            cellsByPoint[pixel.pointIndex].push([pixel.x, pixel.y]);
        });
        
        // For each point, create a cell polygon using a convex hull
        Object.keys(cellsByPoint).forEach(pointIndex => {
            const pixelPoints = cellsByPoint[pointIndex];
            const pointIdx = parseInt(pointIndex, 10);
            
            // Use D3's polygon hull to create a convex hull around the points
            if (pixelPoints.length > 2) {
                const hull = d3.polygonHull(pixelPoints);
                
                if (hull) {
                    // Calculate centroid for label placement
                    const centroid = getCentroid(hull);
                    
                    // Add the cell polygon to the diagram
                    const cell = cellsGroup.append('g')
                        .attr('class', 'voronoi-cell-group')
                        .attr('data-point', pointIdx + 1);
                        
                    // Add the polygon
                    cell.append('polygon')
                        .attr('class', 'voronoi-cell')
                        .attr('points', hull.map(p => p.join(',')).join(' '))
                        .style('fill', getColorForIndex(pointIdx))
                        .style('opacity', '0.4')
                        .style('stroke', getColorForIndex(pointIdx))
                        .style('stroke-width', 1)
                        .style('stroke-opacity', 0.7);
                        
                    // Add connecting line from point to cell
                    if (points[pointIdx]) {
                        const point = points[pointIdx];
                        cell.append('line')
                            .attr('class', 'connector')
                            .attr('x1', point.x)
                            .attr('y1', point.y)
                            .attr('x2', centroid[0])
                            .attr('y2', centroid[1])
                            .style('stroke', getColorForIndex(pointIdx))
                            .style('stroke-width', 1)
                            .style('stroke-dasharray', '3,2')
                            .style('opacity', 0.6);
                    }
                }
            }
        });
    }
    
    // Generate higher-order Voronoi diagram (n-th nearest neighbor)
    function generateHigherOrderVoronoi() {
        // First, render the points
        renderPoints();
        
        // Create a grid of sample points to test distances
        const resolution = 3; // Slightly lower resolution for more complex diagrams
        const cellData = [];
        
        for (let x = 0; x < width; x += resolution) {
            for (let y = 0; y < height; y += resolution) {
                // For each pixel, find the n nearest points
                const distances = [];
                
                points.forEach((point, index) => {
                    const dist = calculateDistance(point.x, point.y, x, y);
                    distances.push({ index, dist });
                });
                
                // Sort by distance
                distances.sort((a, b) => a.dist - b.dist);
                
                // Get the n-th nearest point (order - 1 as index is zero-based)
                if (distances.length >= voronoiOrder) {
                    const nthPoint = distances[voronoiOrder - 1];
                    
                    // Create a unique cell ID based on the set of n nearest points
                    const nearestPoints = distances.slice(0, voronoiOrder).map(d => d.index).sort().join('-');
                    
                    cellData.push({
                        x: x,
                        y: y,
                        pointSet: nearestPoints
                    });
                }
            }
        }
        
        // Group the pixels by their point set
        const cellsByPointSet = {};
        cellData.forEach(pixel => {
            if (!cellsByPointSet[pixel.pointSet]) {
                cellsByPointSet[pixel.pointSet] = [];
            }
            cellsByPointSet[pixel.pointSet].push([pixel.x, pixel.y]);
        });
        
        // For each set of points, create a cell polygon using a convex hull
        Object.keys(cellsByPointSet).forEach((pointSet, idx) => {
            const pixelPoints = cellsByPointSet[pointSet];
            const contributingPoints = pointSet.split('-').map(Number);
            
            // Use D3's polygon hull to create a convex hull around the points
            if (pixelPoints.length > 2) {
                const hull = d3.polygonHull(pixelPoints);
                
                if (hull) {
                    // Calculate centroid for label placement
                    const centroid = getCentroid(hull);
                    
                    // Add the cell polygon to the diagram
                    const cell = cellsGroup.append('g')
                        .attr('class', 'voronoi-cell-group')
                        .attr('data-point-set', contributingPoints.map(i => i + 1).join(','));
                        
                    // Add the polygon
                    cell.append('polygon')
                        .attr('class', 'voronoi-cell')
                        .attr('points', hull.map(p => p.join(',')).join(' '))
                        .style('fill', getColorForIndex(idx))
                        .style('opacity', '0.4')
                        .style('stroke', getColorForIndex(idx))
                        .style('stroke-width', 1)
                        .style('stroke-opacity', 0.7);
                    
                    // Add cell label to show which points contribute to this cell
                    cell.append('text')
                        .attr('class', 'cell-label')
                        .attr('x', centroid[0])
                        .attr('y', centroid[1])
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .style('font-size', '11px')
                        .style('font-weight', 'bold')
                        .style('fill', '#333')
                        .text(contributingPoints.map(i => i + 1).join(','));
                        
                    // Add connecting lines from points to cell
                    contributingPoints.forEach(pointIdx => {
                        if (points[pointIdx]) {
                            const point = points[pointIdx];
                            cell.append('line')
                                .attr('class', 'connector')
                                .attr('x1', point.x)
                                .attr('y1', point.y)
                                .attr('x2', centroid[0])
                                .attr('y2', centroid[1])
                                .style('stroke', getColorForIndex(pointIdx))
                                .style('stroke-width', 1)
                                .style('stroke-dasharray', '3,2')
                                .style('opacity', 0.5);
                        }
                    });
                }
            }
        });
    }
    
    // Calculate the centroid of a polygon
    function getCentroid(points) {
        let x = 0;
        let y = 0;
        
        points.forEach(p => {
            x += p[0];
            y += p[1];
        });
        
        return [x / points.length, y / points.length];
    }
    
    // Get a color for a specific index
    function getColorForIndex(index) {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
            '#1abc9c', '#d35400', '#34495e', '#16a085', '#c0392b',
            '#2980b9', '#8e44ad', '#27ae60', '#e67e22', '#7f8c8d'
        ];
        return colors[index % colors.length];
    }
    
    // Render the points
    function renderPoints() {
        // Create point groups
        const pointElements = pointsGroup.selectAll('.point-group')
            .data(points)
            .enter()
            .append('g')
            .attr('class', 'point-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
            
        // Add circles
        pointElements.append('circle')
            .attr('class', 'point')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 6)
            .style('fill', (d, i) => getColorForIndex(i))
            .style('stroke', 'white')
            .style('stroke-width', 2);
            
        // Add point number labels
        pointElements.append('text')
            .attr('class', 'point-label')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('dy', 0.5)
            .style('fill', 'white')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .text((d, i) => i + 1);
    }
    
    // Generate points in a regular polygon shape
    function createRegularPolygon(sides, radius) {
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
    
    // Generate points in a circular arrangement
    function createCircleOfPoints(count, radius) {
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
    
    // Generate points in a grid arrangement
    function createGridOfPoints(rows, cols) {
        const marginX = width * 0.15;
        const marginY = height * 0.15;
        const stepX = (width - 2 * marginX) / (cols - 1);
        const stepY = (height - 2 * marginY) / (rows - 1);
        const newPoints = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = marginX + col * stepX;
                const y = marginY + row * stepY;
                newPoints.push({ x, y });
            }
        }
        
        return newPoints;
    }
    
    // Generate random points
    function createRandomPoints(count) {
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
    
    // Apply the selected predefined shape
    function applyPredefinedShape() {
        const shapeType = document.getElementById('predefined-shape').value;
        const radius = Math.min(width, height) * 0.4;
        
        // Clear existing points
        points = [];
        
        switch (shapeType) {
            case 'triangle':
                points = createRegularPolygon(3, radius);
                break;
            case 'square':
                points = createRegularPolygon(4, radius);
                break;
            case 'pentagon':
                points = createRegularPolygon(5, radius);
                break;
            case 'hexagon':
                points = createRegularPolygon(6, radius);
                break;
            case 'circle':
                points = createCircleOfPoints(12, radius);
                break;
            case 'grid':
                points = createGridOfPoints(4, 4);
                break;
            case 'random':
                points = createRandomPoints(10);
                break;
            default:
                // Custom points - do nothing
                break;
        }
        
        // Reset order to 1 when changing shapes
        document.getElementById('order').value = 1;
        updateVoronoi();
    }

    // Add a point when the canvas is clicked
    svgElement.addEventListener('click', function(event) {
        const rect = svgElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        points.push({ x, y });
        
        // Set selector back to "Custom Points"
        document.getElementById('predefined-shape').value = 'none';
        
        updateVoronoi();
    });
    
    // Clear all points
    document.getElementById('clear-button').addEventListener('click', function() {
        points = [];
        // Reset order to 1 when clearing points
        document.getElementById('order').value = 1;
        
        // Set selector back to "Custom Points"
        document.getElementById('predefined-shape').value = 'none';
        
        updateVoronoi();
    });
    
    // Apply predefined shape
    document.getElementById('apply-shape').addEventListener('click', function() {
        applyPredefinedShape();
    });
    
    // Update when order is changed
    document.getElementById('order').addEventListener('change', function() {
        updateVoronoi();
    });
    
    // Update when distance metric is changed
    document.getElementById('distance-metric').addEventListener('change', function() {
        updatePValueVisibility();
        updateVoronoi();
    });
    
    // Update when p-value is changed
    document.getElementById('p-value').addEventListener('change', function() {
        updateVoronoi();
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const svgRect = svgElement.getBoundingClientRect();
        svg.attr('width', svgRect.width)
           .attr('height', svgRect.height);
        updateVoronoi();
    });
});

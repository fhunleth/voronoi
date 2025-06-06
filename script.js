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
            
            // Use D3's polygon hull to create a convex hull around the points
            if (pixelPoints.length > 2) {
                const hull = d3.polygonHull(pixelPoints);
                
                if (hull) {
                    // Add the cell polygon to the diagram
                    cellsGroup.append('polygon')
                        .attr('class', 'voronoi-cell')
                        .attr('points', hull.map(p => p.join(',')).join(' '))
                        .style('fill', getColorForIndex(parseInt(pointIndex, 10)))
                        .style('opacity', '0.4');
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
            
            // Use D3's polygon hull to create a convex hull around the points
            if (pixelPoints.length > 2) {
                const hull = d3.polygonHull(pixelPoints);
                
                if (hull) {
                    // Add the cell polygon to the diagram
                    cellsGroup.append('polygon')
                        .attr('class', 'voronoi-cell')
                        .attr('points', hull.map(p => p.join(',')).join(' '))
                        .style('fill', getColorForIndex(idx))
                        .style('opacity', '0.4');
                }
            }
        });
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
        pointsGroup.selectAll('.point')
            .data(points)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 5);
    }
    
    // Add a point when the canvas is clicked
    svgElement.addEventListener('click', function(event) {
        const rect = svgElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        points.push({ x, y });
        updateVoronoi();
    });
    
    // Clear all points
    document.getElementById('clear-button').addEventListener('click', function() {
        points = [];
        // Reset order to 1 when clearing points
        document.getElementById('order').value = 1;
        updateVoronoi();
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

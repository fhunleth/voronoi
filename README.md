# Interactive Voronoi Diagram Generator

A web-based interactive tool for creating and exploring Voronoi diagrams with different distance metrics and orders.

![Voronoi Diagram](https://i.imgur.com/placeholder.jpg)

## Features

- **Interactive Point Placement**: Click anywhere on the canvas to add points
- **Multiple Distance Metrics**:
  - Euclidean distance (standard)
  - Manhattan distance
  - Minkowski distance with customizable P-value
- **Higher-Order Voronoi Diagrams**: Generate nth-order Voronoi diagrams
- **Predefined Shapes**: Quickly create geometric arrangements of points:
  - Equilateral Triangle
  - Square
  - Pentagon
  - Hexagon
  - Circle (12 points)
  - Grid (4×4)
  - Random (10 points)
- **Visual Indicators**: Points and cells are color-coded with connecting lines to show relationships
- **Responsive Design**: Works on various screen sizes

## What is a Voronoi Diagram?

A Voronoi diagram partitions a plane into regions based on the distance to a specified set of points. Each region contains all points that are closer to a specific input point than to any other input point. The diagram is named after mathematician Georgy Voronoi.

### First-Order vs Higher-Order

- **First-Order** (standard): Regions where a specific point is the closest point
- **Second-Order**: Regions where a specific pair of points are the two closest points
- **Third-Order**: Regions where a specific trio of points are the three closest points
- And so on...

### Distance Metrics

The choice of distance metric affects how "distance" between points is calculated:

- **Euclidean**: Straight-line distance (L₂ norm)
- **Manhattan**: Sum of horizontal and vertical distances (L₁ norm)
- **Minkowski**: Generalized metric (Lₚ norm) that includes both Euclidean and Manhattan as special cases

## How to Use

1. Open `index.html` in a modern web browser
2. Click on the canvas to add points manually, or select a predefined shape
3. Adjust the distance metric and P-value settings
4. Change the Voronoi order to explore higher-order diagrams
5. Observe how the cells change and relate to the points

## Implementation Details

This project is implemented using:

- **HTML5/CSS3** for structure and styling
- **JavaScript** for interactivity
- **D3.js** for geometry calculations and visualization

The Voronoi diagram is generated using a sampling approach that calculates distances for a grid of points and then forms convex hulls around the resulting regions.

## Development

To modify or enhance this project:

1. Clone the repository
2. Edit the files:
   - `index.html`: Structure and layout
   - `styles.css`: Visual styling
   - `script.js`: Voronoi diagram logic and interactivity
3. Refresh the browser to see your changes

## Future Enhancements

Potential improvements for future versions:

- Save and load point configurations
- Export diagrams as SVG or PNG
- Additional visualizations (e.g., Delaunay triangulation)
- More interactive features (e.g., draggable points, animation)

## License

CC0 (Creative Commons Zero) - This work is dedicated to the public domain. You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

## Created

June 2025

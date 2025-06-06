// This is a helper script to capture a nice screenshot for the README
// Run this script in the browser console after loading the index.html

// First, set up a nice example with points in a pentagon
document.getElementById('predefined-shape').value = 'pentagon';
document.getElementById('apply-shape').click();

// Wait a moment for the diagram to render
setTimeout(() => {
  // Create a download link for the screenshot
  const svgElement = document.getElementById('voronoi-canvas');

  // You can manually save this as screenshot.png
  console.log('Take a screenshot of the Voronoi diagram now and save it as screenshot.png');
  console.log('Then upload it to your repo and update the README.md image link');

  // Alternatively, with additional libraries, you could automate the screenshot capture
}, 500);


import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import path from 'path';

/**
 * This script is meant to be run once to generate the favicon.
 * It's not used in the application itself.
 * 
 * To use it:
 * 1. Uncomment the code
 * 2. Run with Node.js (needs additional setup)
 * 3. Or use the SVG content directly in a file
 */

/*
// SVG content for the favicon - using the room/building icon
const Favicon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
  >
    <rect width="64" height="64" rx="12" fill="#9b87f5" />
    <path
      d="M18 46V25L32 15L46 25V46H39V33H25V46H18Z"
      fill="white"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Convert the React component to an SVG string
const svgString = ReactDOMServer.renderToStaticMarkup(<Favicon />);

// Write the SVG to a file
const outputPath = path.resolve(__dirname, '../../public/favicon.svg');
fs.writeFileSync(outputPath, svgString);

console.log('Favicon generated successfully at:', outputPath);
*/

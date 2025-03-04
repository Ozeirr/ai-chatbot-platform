/*
 *   Copyright (c) 2025 
 *   All rights reserved.
 */
/**
 * Adjusts a hex color by the given percent
 * @param {string} hex - The hex color
 * @param {number} percent - The percentage to adjust by
 * @returns {string} - The adjusted hex color
 */
export function adjustColor(hex, percent) {
  // Remove hash if present
  hex = hex.replace(/^#/, '');

  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Adjust each component
  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));

  // Convert back to hex
  const adjustedHex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  
  return adjustedHex;
}

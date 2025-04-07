/**
 * Helper function for generating URLs with the correct base path
 * for GitHub Pages deployment
 * 
 * @param {string} path - The path relative to the site root
 * @returns {string} - The full path including the base
 */
export function getPath(path) {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Use Astro's import.meta.env.BASE_URL which includes the base path from config
  // This handles both development and production environments correctly
  return `${import.meta.env.BASE_URL}${cleanPath}`;
}

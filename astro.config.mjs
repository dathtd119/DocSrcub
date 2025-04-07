// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  // Update site URL to your GitHub Pages URL (replace YOUR_USERNAME with your GitHub username)
  site: 'https://YOUR_USERNAME.github.io',
  // Add your repository name as the base
  base: '/DocSrcub',
  output: 'static', // Ensuring static output for client-side processing
  build: {
    assets: 'assets',
  },
});

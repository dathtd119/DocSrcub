// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://docscrub.app',
  output: 'static', // Ensuring static output for client-side processing
  build: {
    assets: 'assets',
  },
});

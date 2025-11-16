import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const {GOOGLE_MAPS_API_KEY = '', VITE_GOOGLE_MAPS_API_KEY = ''} = loadEnv(mode, process.cwd(), '');
  
  // Use VITE_GOOGLE_MAPS_API_KEY first, fallback to GOOGLE_MAPS_API_KEY
  const apiKey = VITE_GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY;

  return {
    define: {
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(apiKey)
    },
    resolve: {
      alias: {
        '@vis.gl/react-google-maps/examples.js':
          'https://visgl.github.io/react-google-maps/scripts/examples.js'
      }
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: true
      }
    }
  };
});

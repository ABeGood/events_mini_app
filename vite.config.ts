import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/events_mini_app/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    // Allows using React dev server along with building a React application with Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Creates a custom SSL certificate valid for the local machine.
    // Using this plugin requires admin rights on the first dev-mode launch.
    // https://www.npmjs.com/package/vite-plugin-mkcert
    process.env.HTTPS && mkcert(),
    // Custom plugin to ensure Telegram script is preserved in build
    {
      name: 'preserve-telegram-script',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html) {
          // Ensure Telegram script has proper attributes to survive build
          return html.replace(
            /<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js(\?[^"]*)?"><\/script>/,
            '<script src="https://telegram.org/js/telegram-web-app.js$1" data-preserve="true"></script>'
          );
        }
      }
    }
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
      output: {
        // Ensure external scripts are not bundled
        manualChunks: undefined
      }
    }
  },
  publicDir: './public',
  server: {
    // Exposes your dev server and makes it accessible for the devices in the same network.
    host: true,
  },
});


import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    // Esto es importante para que ignore los binarios de react-native que dan error en Jenkins
    server: {
      deps: {
        inline: ['react-native', 'expo-router', 'react-native-web']
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'junit'],
    },
  },
});
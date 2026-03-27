
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    base: '/',
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'figma:asset/e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png': path.resolve(__dirname, './src/assets/e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png'),
        'figma:asset/0a00d157a774d4a1c538fd2cb05101097bebd8d5.png': path.resolve(__dirname, './src/assets/0a00d157a774d4a1c538fd2cb05101097bebd8d5.png'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Radix UI components
            'radix-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-slot'],
            // Form and validation
            'form-vendor': ['react-hook-form'],
            // Markdown and helmet
            'content-vendor': ['react-markdown', 'remark-gfm', 'react-helmet-async'],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  });
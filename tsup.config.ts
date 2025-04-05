import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'build',
  format: ['esm'],
  target: 'node18',
  clean: true,
  sourcemap: true,
  noExternal: ['@/'],
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
  },
})

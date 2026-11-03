import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { compilerOptions: { jsx: 'react-jsx', moduleResolution: 'Bundler' } },
  clean: true,
  sourcemap: true,
  external: ['formik', 'react', 'react-dom'],
});

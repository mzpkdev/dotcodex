import { defineConfig } from 'webanvil';

export default defineConfig({
  build: { mode: 'node', entry: 'src/index.ts', formats: ['esm'], target: 'node24' },
  test: { include: ['test/**/*.test.ts'], environment: 'node' },
  format: { semi: true, singleQuote: true, printWidth: 100 },
});

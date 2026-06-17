import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  // Bundle the engine so the published CLI is self-contained.
  noExternal: ['@lockstep/core'],
  banner: { js: '#!/usr/bin/env node' },
});

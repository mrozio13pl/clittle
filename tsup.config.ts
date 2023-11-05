import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    clean: true,
    dts: true,
    minifyIdentifiers: true,
    minifySyntax: true
});
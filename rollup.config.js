import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
    input: 'src/index.ts',
    output: {
        format: 'esm',
        entryFileNames: '[name].js',
        sourcemap: true,
        dir: 'dist',
        preserveModules: true,
    },
    plugins: [
        typescript({
            exclude: ['./tests/**'],
        }),
    ],
});

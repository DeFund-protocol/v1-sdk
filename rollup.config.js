import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: './lib/index.cjs',
      format: 'cjs',
    },
    plugins: [typescript(), json()]
  },
  {
    input: 'src/index.ts',
    output: {
      file: './lib/index.mjs',
      format: 'esm',
    },
    plugins: [typescript(), json()]
  },
  
]
// Small runner that registers ts-node to load a .ts file at runtime.
// This avoids global tsc errors and ESM loader issues by using ts-node's register
// in CommonJS mode.
require('ts-node').register({
  transpileOnly: true,
  // Force CommonJS to avoid ESM .ts extension handling
  compilerOptions: { module: 'CommonJS' }
})

// Require the TypeScript module. Adjust the path if the file moves.
require('./utils/index.ts')

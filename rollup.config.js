import typescript from 'typescript'
import rollupAlias from 'rollup-plugin-alias'
import rollupTypescript from 'rollup-plugin-typescript'
import rollupCleanup from 'rollup-plugin-cleanup'

export default {
  entry: './src/index.ts',
  plugins: [
    rollupAlias({
      tslib: 'node_modules/tslib/tslib.es6.js',
    }),
    rollupCleanup({
      comments: 'none',
      maxEmptyLines: 1
    }),
    rollupTypescript({
      declaration: false,
      importHelpers: true,
      noEmitHelpers: true,
      typescript
    })
  ]
}

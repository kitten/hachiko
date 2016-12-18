import typescript from 'typescript'
import rollupAlias from "rollup-plugin-alias"
import rollupTypescript from 'rollup-plugin-typescript'

export default {
  entry: './src/index.ts',
  plugins: [
    rollupAlias({
      tslib: "node_modules/tslib/tslib.es6.js",
    }),
    rollupTypescript({
      importHelpers: true,
      noEmitHelpers: true,
      typescript
    })
  ]
}

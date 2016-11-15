const tsc = require('typescript');

module.exports = {
  process(src, path) {
    return tsc.transpile(src, {
      module: tsc.ModuleKind.CommonJS,
      jsx: tsc.JsxEmit.React,
    }, path, []);
  }
};

"use strict";
const api = require('../shared');

module.exports = {
    name: 'Merge N',
    description: "Cost to merging an object into a map of size `n`.",
    sizes: [10, 100, 1000, 10000, 100000],
    benchmarks: {}
};

const merge = {
  MERGE_ME: 'MERGE_ME',
  AND_ME: 'AND_ME'
};

module.exports.benchmarks['Immutable'] = keys => {
    const h = api.immutableFrom(keys);
    return function() {
        h.merge(merge)
    };
};

module.exports.benchmarks['Hachiko'] = keys => {
    const h = api.hachikoFrom(keys);
    return function() {
        h.merge(merge)
    };
};

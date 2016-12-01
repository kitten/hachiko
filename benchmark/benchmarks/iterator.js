"use strict";
const api = require('../shared');

module.exports = {
    name: 'Iterate N',
    description: "Cost to iterate all keys using an iterator of size `n`.",
    sizes: [10, 100, 1000, 10000],
    benchmarks: {}
};

module.exports.benchmarks['Immutable'] = (keys, order) => {
    const h = api.immutableFrom(keys);
    return function() {
        let done = false
        const iterator = h.keys()
        while (!done) {
          done = iterator.next().done
        }
    };
};

module.exports.benchmarks['Hachiko'] = (keys, order) => {
    const h = api.hachikoFrom(keys);
    return function() {
        let done = false
        const iterator = h.keys()
        while (!done) {
          done = iterator.next().done
        }
    };
};

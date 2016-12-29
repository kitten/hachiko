"use strict";
const ImmutableList = require('immutable').List;
const HachikoList = require('../../lib/List.js').default;

module.exports = {
    name: 'Push N (List)',
    description: "Cost to add `n` values to a list.",
    sizes: [10, 100, 1000, 10000, 100000],
    benchmarks: {}
};

module.exports.benchmarks['Immutable'] = keys => {
    return function() {
        let h = new ImmutableList();
        for (let i = 0, len = keys.length; i < len; ++i) {
            h = h.push(keys[i]);
        }
    };
};

module.exports.benchmarks['Hachiko'] = keys => {
    return function() {
        let h = new HachikoList();
        for (let i = 0, len = keys.length; i < len; ++i) {
            h = h.push(keys[i]);
        }
    };
};

"use strict";
const ImmutableList = require('immutable').List;
const HachikoList = require('../../lib/List.js').default;

module.exports = {
    name: 'Push N (transient) (List)',
    description: "Cost to add `n` values to a list.\n" +
        "Uses transiently mutable list interface if supported.",
    sizes: [10, 100, 1000, 10000, 100000],
    benchmarks: {}
};

module.exports.benchmarks['Immutable'] = keys => {
    return function() {
        let h = new ImmutableList().asMutable();
        for (let i = 0, len = keys.length; i < len; ++i) {
            h = h.push(keys[i]);
        }
        h.asImmutable();
    };
};

module.exports.benchmarks['Hachiko'] = keys => {
    return function() {
        let h = new HachikoList().asMutable();
        for (let i = 0, len = keys.length; i < len; ++i) {
            h = h.push(keys[i]);
        }
        h.asImmutable();
    };
};

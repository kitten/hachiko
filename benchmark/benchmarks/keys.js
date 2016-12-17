"use strict";
const api = require('../shared');
const ht = require('hashtrie');
const hamt = require('hamt');
const hamt_plus = require('hamt_plus');
const mori = require('mori');
const immutable = require('immutable');

module.exports = {
    name: 'Keys',
    description: "Cost to keys as JS array from map of size `n`.",
    sizes: [10, 100, 1000, 10000],
    benchmarks: {}
};

module.exports.benchmarks['Native Object'] = keys => {
    const h = api.nativeObjectFrom(keys);
    return function() {
        Object.keys(h);
    };
};

module.exports.benchmarks['Native Map'] = keys => {
    const h = api.nativeMapFrom(keys);
    return function() {
        Array.from(h.keys());
    };
};

module.exports.benchmarks['Hamt'] = keys => {
    const h = api.hamtFrom(keys);
    return function() {
        Array.from(hamt.keys(h));
    };
};

const build = (p, _, k) => {
    p.push(k);
    return p;
};
module.exports.benchmarks['Hamt fold'] = keys => {
    const h = api.hamtFrom(keys);
    return function() {
        hamt.fold(build, [], h);
    };
};

module.exports.benchmarks['Hamt+'] = keys => {
    const h = api.hamtPlusFrom(keys);
    return function() {
        Array.from(hamt_plus.keys(h));
    };
};

module.exports.benchmarks['Hamt+ fold'] = keys => {
    const h = api.hamtPlusFrom(keys);
    return function() {
        hamt_plus.fold(build, [], h);
    };
};

module.exports.benchmarks['Mori'] = keys => {
    const h = api.moriFrom(keys);
    return function() {
        mori.intoArray(mori.keys(h));
    };
};

module.exports.benchmarks['Immutable'] = keys => {
    const h = api.immutableFrom(keys);
    return function() {
        h.keySeq().toArray();
    };
};

module.exports.benchmarks['Hachiko'] = keys => {
    const h = api.hachikoFrom(keys);
    return function() {
        h.reduce((acc, x, key) => {
            acc.push(key)
            return acc
        }, [])
    };
};

<p align="center"><img src="https://raw.githubusercontent.com/philpl/hachiko/master/docs/logo.gif" width=250></p>
<h2 align="center">Hachiko</h2>
<p align="center">
<strong>Modular and performant data collections for JavaScript (Abandoned 😞)</strong>
<br><br>
<a href="https://travis-ci.org/philpl/hachiko"><img src="https://img.shields.io/travis/philpl/hachiko/master.svg"></a>
<a href="https://coveralls.io/github/philpl/hachiko"><img src="https://img.shields.io/coveralls/philpl/hachiko/master.svg"></a>
<a href="https://npmjs.com/package/hachiko"><img src="https://img.shields.io/npm/dm/hachiko.svg"></a>
<a href="https://npmjs.com/package/hachiko"><img src="https://img.shields.io/npm/v/hachiko.svg"></a>
</p>

**Hachiko** is a data collection library that tries to continue what Immutable.js started.
By offering a similar API, a smaller focus and micro optimizations, this project is trying
to be a good alternative.

It's persistent like Immutable.js, more performant, and offers the most commonly used
data collections, namely: Map, List, OrderedMap, Set, and OrderedSet.

## Benchmarks (up to date with `master`)

Benchmarks indicated that Hachiko's Map implementation beat Immutable's in almost all benchmarks that were thrown at it that
are commonly used to benchmarks HAMT implementations:

https://gist.github.com/philpl/07fb531b6127c73c7d5c1023967e459e

## Status

Only the `Map` data structure was ever implemented and work has stopped one year ago (December 2016)

- [x] Map
- [ ] List
- [ ] OrderedMap
- [ ] Set
- [ ] OrderedSet


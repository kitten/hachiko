const Benchmark = require('benchmark')
const wordArr = require('./fixtures/word-arr')

const HachikoMap = require('../lib/Map.js').default
const ImmutableMap = require('immutable').Map
const Hamt = require('hamt')

const suite = new Benchmark.Suite()

let hachiko = new HachikoMap()
wordArr.forEach(function (key) {
  hachiko = hachiko.set(key, key)
})

let immutable = new ImmutableMap()
wordArr.forEach(function (key) {
  immutable = immutable.set(key, key)
})

suite
  .add('Hachiko#Map#map', function () {
    hachiko.map(str => str + 'BLA')
  })
  .add('Immutable#Map#map', function () {
    immutable.map(str => str + 'BLA')
  })
  .on('error', function (err) {
    console.error(err)
  })
  .on('cycle', function (evt) {
    console.log(evt.target.toString())
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run()
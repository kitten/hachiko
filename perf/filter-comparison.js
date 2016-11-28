const Benchmark = require('benchmark')
const wordArr = require('./fixtures/word-arr')

const HachikoMap = require('../lib/Map.js').default
const ImmutableMap = require('immutable').Map

const suite = new Benchmark.Suite()

let hachiko = new HachikoMap()
wordArr.forEach(function (key) {
  hachiko = hachiko.set(key, key)
})

let immutable = new ImmutableMap()
wordArr.forEach(function (key) {
  immutable = immutable.set(key, key)
})

const predicate = function (value) {
  return value.length % 2 === 0
}

suite
  .add('Hachiko#Map#filter', function () {
    hachiko.filter(predicate)
  })
  .add('Immutable#Map#filter', function () {
    immutable.filter(predicate)
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

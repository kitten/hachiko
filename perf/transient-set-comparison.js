const Benchmark = require('benchmark')
const wordArr = require('./fixtures/word-arr')

const HachikoMap = require('../lib/Map.js').default
const ImmutableMap = require('immutable').Map
const Hamt = require('hamt')

const suite = new Benchmark.Suite()

suite
  .add('Hachiko#Map#set', function () {
    let temp = new HachikoMap().asMutable()
    wordArr.forEach(function (key) {
      temp = temp.set(key, key)
    })

    temp = temp.asImmutable()
  })
  .add('Immutable#Map#set', function () {
    let temp = new ImmutableMap().asMutable()
    wordArr.forEach(function (key) {
      temp = temp.set(key, key)
    })

    temp = temp.asImmutable()
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

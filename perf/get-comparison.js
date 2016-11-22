const Benchmark = require('benchmark')
const wordArr = require('./fixtures/word-arr')

const KVNode = require('../lib/kv/node.js').default
const Map = require('immutable').Map
const Hamt = require('hamt')

const suite = new Benchmark.Suite()

let hachiko = new KVNode()
wordArr.forEach(function (key) {
  hachiko = hachiko.set(key, key)
})

let immutable = new Map()
wordArr.forEach(function (key) {
  immutable = immutable.set(key, key)
})

let hamt = Hamt.empty
wordArr.forEach(function (key) {
  hamt = hamt.set(key, key)
})

suite
  .add('Hachiko#KVNode#get', function () {
    wordArr.forEach(function (key) {
      hachiko.get(key, key)
    })
  })
  .add('Immutable#Map#get', function () {
    wordArr.forEach(function (key) {
      immutable.get(key, key)
    })
  })
  .add('HAMT#get', function () {
    wordArr.forEach(function (key) {
      hamt.get(key, key)
    })
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

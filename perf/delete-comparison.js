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

let hamt = Hamt.empty
wordArr.forEach(function (key) {
  hamt = hamt.set(key, key)
})

const toBeDeleted = []
for (let i = 0; i < 20; i++) {
  const num = Math.floor(Math.random() * wordArr.length)
  const word = wordArr[num]
  toBeDeleted.push(word)
}

const toBeSearched = []
for (let i = 0; i < 20; i++) {
  const num = Math.floor(Math.random() * wordArr.length)
  const word = wordArr[num]
  toBeSearched.push(word)
}

suite
  .add('Hachiko#Map#delete', function () {
    toBeDeleted.forEach(function (key) {
      hachiko = hachiko.delete(key)
    })

    toBeSearched.forEach(function (key) {
      hachiko.get(key)
    })
  })
  .add('Immutable#Map#delete', function () {
    toBeDeleted.forEach(function (key) {
      immutable = immutable.delete(key)
    })

    toBeSearched.forEach(function (key) {
      immutable.get(key)
    })
  })
  .add('HAMT#delete', function () {
    toBeDeleted.forEach(function (key) {
      hamt = hamt.delete(key)
    })

    toBeSearched.forEach(function (key) {
      hamt.get(key)
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

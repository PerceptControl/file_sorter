const Collector = require('../src/utils/collector')

describe('collector', () => {
  it('correct', (done) => {
    let coll = new Collector(['a', 'b', 'c'])
    coll.done((err, items) => {
      expect(err).toBeNull()
      expect(items.get('a')).toBe(1)
      expect(items.get('b')).toBe(2)
      expect(items.get('c')).toBe(3)
      done()
    })

    coll.pick('a', 1)
    coll.pick('b', 2)
    coll.collect('c', null, 3)

    expect(coll.show('a')).toBe(1)
  })

  it('with fail', (done) => {
    let coll = new Collector(['a', 'b', 'c'])
    coll.done((err, items) => {
      expect(err).toBe(2)
      expect(items.get('a')).toBe(1)
      expect(items.get('b')).toBeUndefined()
      expect(items.get('c')).toBeUndefined()
      done()
    })

    coll.pick('a', 1)
    coll.fail('b', 2)
    coll.collect('c', null, 3)

    expect(coll.show('a')).toBe(1)
    expect(coll.show('b')).toBeUndefined()
    expect(coll.show('c')).toBeUndefined()
  })
})

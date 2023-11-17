const generator = require('../src/generator')
const fs = require('node:fs')

describe('generator check', () => {
  it('generate 100mb', (done) => {
    generator({ name: 'generated_test.txt', sizeInMb: 100 }, (err, rstream) => {
      console.log(rstream)
      expect(rstream.bytesWritten).toBe(100 * 1024 ** 2)
      done()
    })
  })
})

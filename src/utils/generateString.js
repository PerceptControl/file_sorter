const { random } = require('./utils/math')

module.exports = function (maxSize) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const buffer = Buffer.alloc(random(1, maxSize), 'x')
  for (let i = 0; i < buffer.byteLength - 1; i++)
    buffer[i] = characters[random(0, characters.length - 1)].charCodeAt(0)
  buffer[-1] = '\n'.charCodeAt(0)

  return buffer
}

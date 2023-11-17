const fs = require('node:fs')
const path = require('node:path')

const events = require('node:events')

const { random, min } = require('./utils/math')

const BYTES_IN_MB = 1024 ** 2
const BYTES_IN_100MB = BYTES_IN_MB * 100

function getString(maxSize) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const buffer = Buffer.alloc(random(1, maxSize))
  for (let i = 0; i < buffer.byteLength - 2; i++)
    buffer[i] = characters.charCodeAt(random(0, characters.length - 1))
  buffer[-2] = '\r'.charCodeAt(0)
  buffer[-1] = '\n'.charCodeAt(0)

  return buffer.toString('utf-8')
}

/**
 *
 * @param {object} config
 * @param {(rs: fs.WriteStream) => void} cb
 */
function generator(config, cb) {
  if (!config) config = require('/config/base.json')
  if (!config.path) config.path = '/dst'
  if (!config.name || !config.generator.sizeInMb) throw Error('wrong config')

  const computedPath = path.join(config.path, config.name)
  const wstream = fs.createWriteStream(computedPath, {
    flags: 'w',
    highWaterMark: BYTES_IN_100MB,
    encoding: 'utf-8',
  })

  wstream.on('ready', async () => {
    let writed = 0
    let targetFileSize = config.generator.sizeInMb * BYTES_IN_MB
    while (writed < targetFileSize) {
      let channelCap = BYTES_IN_100MB - wstream.writableLength

      let data = getString(min(channelCap, targetFileSize - writed))
      wstream.cork()
      wstream.write(data)
      wstream.uncork()
      writed += data.length

      if (wstream.writableNeedDrain) await events.once(wstream, 'drain')
    }

    wstream.end(() => {
      wstream.close((err) => {
        console.log(`Writed: ${wstream.bytesWritten}`)
        if (cb) cb(err, wstream)
      })
    })
  })
}

module.exports = generator
if ((process.env.EXEC = true)) generator()

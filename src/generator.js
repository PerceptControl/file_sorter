const fs = require('node:fs')
const path = require('node:path')

const { min } = require('./utils/math')
const { STREAM_CAP } = require('./utils/streams')
const generateString = require('./utils/generateString')

const BYTES_IN_MB = 1024 ** 2

/**
 *
 * @param {object} config
 * @param {(rs: fs.WriteStream) => void} cb
 */
function Generator(config, cb) {
  if (!config) config = require('/config/base.json')
  if (!config.generator.path) config.path = '/dst'
  if (!config.generator.name || !config.generator.sizeInMb)
    throw Error('wrong config')

  const computedPath = path.join(config.generator.path, config.generator.name)
  const wstream = fs.createWriteStream(computedPath, {
    flags: 'w',
    highWaterMark: STREAM_CAP,
    encoding: 'utf-8',
  })

  const target_file = {
    totalSize: config.generator.sizeInMb * BYTES_IN_MB,
    writed: 0,
  }
  const line = {
    data: null,
    writed: true,
  }

  function update_line() {
    const channel_cap = wstream.writableHighWaterMark - wstream.writableLength
    const file_cap = target_file.totalSize - target_file.writed
    if (process.env.DEBUG) {
      console.group('debug')
      console.log(
        `Capacity; Channel: ${channel_cap / BYTES_IN_MB}, File: ${
          file_cap / BYTES_IN_MB
        }`,
      )
      console.log(
        `Stream; highWaterMarkL ${
          wstream.writableHighWaterMark / BYTES_IN_MB
        }; writable length: ${wstream.writableLength / BYTES_IN_MB}`,
      )
      console.groupEnd('debug')
    }

    line.data = generateString(min(channel_cap, file_cap))
    line.writed = false
  }

  function start_writing() {
    while (target_file.writed < target_file.totalSize) {
      if (!wstream.writable) return
      if (line.writed) update_line()
      target_file.writed += line.data.length + 1
      if (!wstream.write(line.data, 'utf-8')) return
      line.writed = true
    }
    wstream.end()
  }

  wstream
    .on('ready', () => {
      start_writing()
      if (target_file.writed >= target_file.totalSize) return void wstream.end()
    })
    .on('drain', () => {
      line.writed = true
      if (target_file.writed >= target_file.totalSize) return void wstream.end()
      start_writing()
    })
    .on('error', console.error)
    .on('close', () => {
      if (cb) cb(wstream)
    })
}

module.exports = Generator
if (process.env.EXEC) Generator()
if (process.env.DEBUG) {
  console.log('Process RAM: ', process.constrainedMemory() / 1024 ** 2, 'Mb')
  console.log('Process mem: ', process.memoryUsage())
  console.log('Abailable RAM: ', require('node:os').freemem() / 1024 ** 2, 'Mb')
  console.log('Total RAM: ', require('node:os').totalmem() / 1024 ** 2, 'Mb')
}

Generator(
  { generator: { path: 'out', name: 'generated.txt', sizeInMb: 100 } },
  (stream) => {
    console.log('written: ', stream.bytesWritten)
  },
)

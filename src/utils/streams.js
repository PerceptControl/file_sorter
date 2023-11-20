const fs = require('node:fs')
const readline = require('node:readline')

const { min } = require('./math')

const BYTES_IN_MB = 1024 ** 2
const computedStreamCap = 0.5 * process.memoryUsage.rss()
const maxStreamCap = 100 * BYTES_IN_MB
const STREAM_CAP = min(computedStreamCap, maxStreamCap)

/**
 *
 * @param {string} path
 * @param {{(path: string, lines: [string, number][]) => void}} cb
 */
async function readLinesLength(path, cb) {
  if (!path || typeof path != 'string') throw Error('wrong path')

  try {
    await fs.promises.access(path)

    const rstream = fs.createReadStream(path, {
      //создаем поток с динамичной пропускной способностью
      highWaterMark: STREAM_CAP,
    })

    /**
     * @type {[string, number][]}
     */
    let currentLinePosition = 0
    const lines = []
    const rl = readline.createInterface(rstream)

    rl.on('line', async (line) => {
      currentLinePosition++
      lines.push([line.length, currentLinePosition])
    }).on('close', async () => {
      cb(lines)
    })
  } catch (e) {
    console.error(e)
  }
}

async function readLine(path, targetPosition, cb) {
  if (!path || typeof path != 'string') throw Error('wrong path')
  return new Promise((resolve) => {
    const rstream = fs.createReadStream(path, {
      encoding: 'utf-8',
    })
    const rl = readline.createInterface(rstream)
    let currentPosition = 1
    let currentString = null

    rl.on('line', async (line) => {
      if (currentPosition != targetPosition) return currentPosition++
      currentString = line
      rl.close()
    }).on('close', async () => {
      if (currentString) cb(currentString, resolve)
      resolve()
    })
  })
}

/**
 *
 * @param {string} from
 * @param {string} to
 * @param {number[]} lines
 */
async function copyLines(from, to, lines) {
  for (let [_, line] of lines) {
    await readLine(from, line, (readed, done) => {
      function close(stream) {
        stream.end('\n', () => {
          stream.close()
        })
      }
      const wstream = fs.createWriteStream(to, {
        flags: 'w+',
        highWaterMark: STREAM_CAP,
      })
      let lastWrited = 0
      wstream
        .on('ready', () => {
          if (!wstream.write(readed)) return
        })
        .on('drain', () => {
          close(wstream)
        })
        .on('close', () => {
          done()
        })
    })
  }
}

module.exports = {
  readLinesLength,
  copyLines,
  STREAM_CAP,
}

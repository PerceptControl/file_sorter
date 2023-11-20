const fs = require('node:fs')
const readline = require('node:readline')
const events = require('node:events')

const { min } = require('./math')

const BYTES_IN_MB = 1024 ** 2
const computedStreamCap =
  0.8 * process.constrainedMemory() ?? process.memoryUsage.rss()
const maxStreamCap = 100 * BYTES_IN_MB
const STREAM_CAP = Math.floor(min(computedStreamCap, maxStreamCap))

if (process.env.DEBUG) {
  console.group('Process cap')
  console.log('Computed: ', computedStreamCap)
  console.log('Actual: ', STREAM_CAP)
  console.groupEnd('Process cap')
}

/**
 *
 * @param {string} path
 * @param {{(path: string, lines: [string, number][]) => Promise<void>}} cb
 */
function readLinesLength(path) {
  return new Promise((resolve, reject) => {
    if (!path || typeof path != 'string') reject(new Error('wrong path'))
    fs.promises.access(path).then(() => {
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

      rl.on('line', (line) => {
        line.trim()
        if (line.length == 0) return
        currentLinePosition++
        lines.push([line.length, currentLinePosition])
      }).on('close', () => {
        resolve(lines)
      })
    }, reject)
  })
}

/**
 *
 * @param {string} from
 * @param {string} to
 * @param {number[]} lines
 */
async function copyLines(from, to, lines) {
  const wstream = fs.createWriteStream(to, {
    flags: 'w+',
    highWaterMark: STREAM_CAP,
    encoding: 'utf-8',
  })

  /**
   * алгоритм переноса сделан втупую, поскольку задание, опять же, не боевое
   * варианты улучшения:
   * - распараллелить запись и чтение(создавать несколько асинхронных потоков, которые ищут свои строки и затем записывают строки пачкой)
   * - увеличение работы одного потока чтения(создавать массивы строк сумма размеров которых меньше n и отдавать на поток чтения сразу пачку строк,
   * таким образом повыситься эффективность отдельного потока и можно будет за один проход по файлу найти больше нужных строк и отправить их на запись
   * - есть теория что можно в итоговый файл сначала записать \n * на количество строк и дальше параллельно записывать в файл по несколько строк,
   * поскольку можно гарантировать что на одну \n приходится всего 1 строка. Но это лишь теория, поскольку параллельная запись вероятно будет друг друга перезаписывать)
   */
  for (let [_, line] of lines) {
    let status = wstream.write(await readLines(from, line))
    if (!status) await events.once(wstream, 'drain')
  }

  wstream.close()
  events.once(wstream, 'close')
}

//TODO можно побаловаться с offset'ом, чтобы не пробегать каждый раз по всем строкам, а идти по файлу как по массиву(n + смещение)
//Но для этого вероятно нельзя использовать readline api. Нужно тестировать и писать через обычный поток в режиме паузы
function readLines(path, targetPosition) {
  if (!path || typeof path != 'string') throw Error('wrong path')
  return new Promise((resolve) => {
    const rstream = fs.createReadStream(path, {
      encoding: 'utf-8',
    })
    const rl = readline.createInterface({ input: rstream, terminal: false })
    let currentPosition = 1
    let currentString = null

    rl.on('line', (line) => {
      line.trim()
      if (line.length == 0) return
      if (currentPosition != targetPosition) return currentPosition++
      currentString = line
      rl.close()
    }).on('close', () => {
      rstream.close()
      resolve(currentString + '\n')
    })
  })
}

module.exports = {
  readLinesLength,
  copyLines,
  STREAM_CAP,
}

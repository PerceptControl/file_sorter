const path = require('node:path')

const { readLinesLength, copyLines } = require('./utils/streams')
const MergeSort = require('./utils/sort')

async function Sorter(config = null) {
  if (!config) config = require('/config/base.json')
  if (!config.sorter.path) config.sorter.path = '/dst'
  if (!config.sorter.name || !config.sorter.src) throw Error('wrong config')

  const lines = await readLinesLength(config.sorter.src)
  MergeSort(lines)
  await copyLines(
    config.sorter.src,
    path.join(config.sorter.path, config.sorter.name),
    lines,
  )
}

module.exports = {
  sorter: Sorter,
}

if (process.env.EXEC) Sorter()
Sorter({
  name: 'generated.txt',
  sorter: {
    path: path.join(__dirname, '../dist'),
    name: 'sorted.txt',
    src: path.join(__dirname, '../out/generated.txt'),
  },
  generator: {
    generator: { path: 'out', name: 'generated.txt', sizeInMb: 100 },
  },
})

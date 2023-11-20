/**
 *
 * @param {[string, number][]} lines
 */
function sortLines(lines) {
  const snapshot = new Map()
  for (let i = 0; i < lines.length; i++) {
    if (!snapshot.has(lines[i][0])) {
      snapshot.set(lines[i][0], [lines[i][1]])
      continue
    }

    snapshot.get(lines[i][0]).push(lines[i][1])
  }
  mergeSort(lines)
  for (let i = 0; i < lines.length; i++) {
    let snapshot_slot = snapshot.get(lines[i][0])
    if (snapshot_slot.length == 1) lines[i][1] = snapshot_slot[0]
    else lines[i][1] = snapshot_slot.pop()
  }
}

/**
 *
 * @param {[number, number][]} arr
 * @param {number} beg
 * @param {number} mid
 * @param {number} end
 * @param {number} maxele
 */
function merge(arr, beg, mid, end, maxele) {
  let i = beg
  let j = mid + 1
  let k = beg
  while (i <= mid && j <= end) {
    if (arr[i][0] % maxele <= arr[j][0] % maxele) {
      arr[k][0] = arr[k][0] + (arr[i][0] % maxele) * maxele
      k++
      i++
    } else {
      arr[k][0] = arr[k][0] + (arr[j][0] % maxele) * maxele
      k++
      j++
    }
  }
  for (; i <= mid; k++, i++)
    arr[k][0] = arr[k][0] + (arr[i][0] % maxele) * maxele
  for (; j <= end; k++, j++)
    arr[k][0] = arr[k][0] + (arr[j][0] % maxele) * maxele

  for (i = beg; i <= end; i++) arr[i][0] = Math.floor(arr[i][0] / maxele)
}

/**
 *
 * @param {[number,number][]} arr
 * @param {number} beg
 * @param {number} end
 * @param {number} maxele
 */
function mergeSortRec(arr, beg, end, maxele) {
  if (beg < end) {
    let mid = Math.floor((beg + end) / 2)
    mergeSortRec(arr, beg, mid, maxele)
    mergeSortRec(arr, mid + 1, end, maxele)
    merge(arr, beg, mid, end, maxele)
  }
}

/**
 *
 * @param {[number, number][]} arr
 */
function mergeSort(arr) {
  let maxele = 0
  for (let i = 0; i < arr.length; i++)
    if (arr[i][0] > maxele) maxele = arr[i][0] + 1
  mergeSortRec(arr, 0, arr.length - 1, maxele)
}

module.exports = sortLines

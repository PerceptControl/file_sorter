module.exports.random = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 *
 * @param {number} target
 * @param {number} max
 * @returns возвращает target если он меньше max
 */
module.exports.min = function (target, max) {
  return target <= max ? target : max
}

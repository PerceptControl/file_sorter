module.exports = class Collector {
  #isDone = false
  #onDone = null
  #keys = {
    got: new Map(),
    expect: new Set(),
  }
  constructor(...keys) {
    this.#keys.expect = new Set(...keys)
  }

  /**
   *
   * @param {string} key
   * @param {Error} err
   * @param {unknown} value
   * @returns
   */
  collect(key, err, value) {
    if (this.#isDone || !this.#keys.expect.has(key)) return this
    if (err) return this.finalize(err, this.#keys.got)

    this.#keys.got.set(key, value)
    if (this.#keys.got.size == this.#keys.expect.size)
      return this.finalize(null, this.#keys.got)
    return this
  }

  /**
   *
   * @param {string} key
   * @param {unknown} value
   * @returns
   */
  pick(key, value) {
    this.collect(key, null, value)
    return this
  }

  /**
   * @param {string} key
   * @param {Error} err
   * @returns
   */
  fail(key, err) {
    this.collect(key, err)
    return this
  }

  finalize(err, data) {
    if (this.#isDone) return this
    if (this.#onDone) this.#onDone(err, data)
    this.#isDone = true
    return this
  }

  /**
   *
   * @param {string} key
   * @returns unknown
   */
  show(key) {
    return this.#keys.got.get(key)
  }

  /**
   *
   * @param {(err, data) => void} cb
   */
  done(cb) {
    this.#onDone = cb
    return this
  }
}

class PromiseWorker {
  constructor(fn) {
    this._queue = []
    this._worker = new Worker('data:text/javascript,' + encodeURIComponent(`'use strict';const __fn = ${fn};onmessage = e => postMessage(__fn(...e.data));`))
    this._worker.onmessage = e => this._queue.shift().resolve(e.data)
    this._worker.onerror = e => this._queue.shift().reject(e.error)
  }
  run(...args) {
    return new Promise((resolve, reject) => {
      this._queue.push({ resolve, reject })
      this._worker.postMessage(args)
    })
  }
}

/**
 * 获取类型
 * @param {any}
 * @return {String}
 */
function getType(value) {
  const str = typeof value
  if (str === 'object') {
    return value === null
      ? null
      : Object.prototype.toString
          .call(value)
          .slice(8, -1)
          .toLowerCase()
  }
  return str
}
/**
 * 获取guid
 * @return {String} guid
 */
function guid() {
  // 生产guid
  return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0
    var v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
function extendsObject(...args) {
  let cArgs = args.map(a => {
    return a ? a : Object.create(null)
  })
  return Object.assign(...cArgs)
}
export { guid, getType, extendsObject }

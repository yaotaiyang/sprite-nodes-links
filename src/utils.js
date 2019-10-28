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
function getPolygonIntersectionPoint(points, startPoint, endPoint, multi = false) {
  let arrRes = []
  for (let i = 0; i < points.length; i++) {
    let res = []
    if (i === 0) {
      res = segmentsIntersectionPoint(points[points.length - 1], points[0], startPoint, endPoint)
    } else {
      res = segmentsIntersectionPoint(points[i - 1], points[i], startPoint, endPoint)
    }
    if (res) {
      arrRes.push(res)
      if (!multi) {
        break
      }
    }
  }
  if (multi) {
    return arrRes
  } else {
    return arrRes[0]
  }
}

function getAngleByPoints(point1, point2) {
  let angle = Math.atan2(point2[1] - point1[1], point2[0] - point1[0]) // 弧度
  let theta = angle * (180 / Math.PI) // 角度
  return { angle, theta }
}

function getDistansceByPoints(point1, point2) {
  return Math.sqrt((point2[0] - point1[0]) ** 2 + (point2[1] - point1[1]) ** 2)
}
/**
 * 获取直线上到point1距离为d的点坐标
 * @param {*} point1 直线开始坐标
 * @param {*} point2 直线结束坐标
 * @param {*} distance 直线上一点到point1点的距离
 */
function getPointByDistance(point1, point2, distance) {
  const [x1, y1] = point1
  const [x2, y2] = point2
  const r = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
  const x = (distance * (x2 - x1)) / r + x1
  const y = (distance * (y2 - y1)) / r + y1
  return [x, y]
}
export { guid, getType, extendsObject, getAngleByPoints, getDistansceByPoints, getPointByDistance, getPolygonIntersectionPoint }

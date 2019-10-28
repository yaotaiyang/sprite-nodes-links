import Base from './Base'
import { Scene } from 'spritejs'
import Node from './Node'
import Link from './Link'
import { getType, getDistansceByPoints, getPointByDistance } from './utils'
import Ticks from './Ticks'
class Stage extends Base {
  constructor(attrs) {
    super(attrs)
    let defaultAttrs = {
      selector: '',
      size: [600, 400],
      zoom: [0.5, 2]
    }
    let thisAttrs = Object.assign(defaultAttrs, attrs)
    this.attr(thisAttrs)
    let { selector, size } = thisAttrs
    let scene = new Scene(selector, {
      viewport: size,
      displayRatio: 'auto'
    })
    this.nodes = []
    this.links = []
    this.tick = new Ticks() //循环函数
    this.containers = [this.container]
    this.layers = Object.create(null)
    this.layers['default'] = scene.layer('default')
    scene.delegateEvent('mousewheel', document)
    this.layers.default.append(this.container)
    if (this.attr('zoom') !== false) {
      this.containers.forEach(container => {
        zoom.call(this, container.layer, container)
      })
    }
  }
  append(sprite) {
    if (sprite === undefined) return
    if (getType(sprite) === 'array') {
      sprite.forEach(sp => {
        this.append(sp)
      })
      return
    }
    sprite.stage = this
    sprite.$parent = this.container
    if (sprite instanceof Node) {
      let nodes = this.nodes
      let curId = sprite.attr('id')
      for (let i = 0; i < nodes.length; i++) {
        // 如果存在相同id的step，删除开始的一个
        let myId = nodes[i].attr('id')
        if (myId === curId) {
          console.warn(`exist the same Step(id:${curId}),please remove it first `)
          return
        }
      }
      nodes.push(sprite)
    } else if (sprite instanceof Link) {
      let links = this.links
      let { startId, endId } = sprite.attr()
      for (let i = 0; i < links.length; i++) {
        // 如果存在相同id的link，删除开始的一个
        let { startId: cStartId, endId: CEndId } = links[i].attr()
        if (cStartId === startId && CEndId === endId) {
          console.warn(`exist the same Link(startId:${startId},endId:${endId}),please remove it first `)
          return
        }
      }
      if (startId === endId) {
        // 如果有相同的link
        console.warn(`the  Link(startId:${startId}),has the same startId and endId `)
        return
      }
      links.push(sprite)
    }
    this.container.append(sprite.render())
    sprite.dispatchEvent('mounted', {})
    this.checkForceLink()
    this.reSize()
  }
  checkForceLink() {
    let hasForce = false
    for (let i = 0; i < this.nodes.length; i++) {
      let forceLink = this.nodes[i].attr('forceLink')
      if (forceLink && forceLink.length > 0) {
        hasForce = true
        break
      }
    }
    if (hasForce) {
      this.tick.clear()
      this.tick.add(tick.bind(this))
    }
  }
  clear() {
    this.steps = []
    this.links = []
    this.container.clear()
  }
}

function tick() {
  //tick函数
  let nodes = this.nodes
  let links = this.links
  let animate = false
  for (let i = 0; i < nodes.length; i++) {
    let sNode = nodes[i]
    let sfl = sNode.attr('forceLink')
    if (sfl && sfl[0] !== undefined) {
      for (let j = i + 1; j < nodes.length; j++) {
        let eNode = nodes[j]
        let efl = eNode.attr('forceLink')
        if (efl && efl[0] !== undefined) {
          let res = pushNode(sNode, eNode, sfl, efl)
          if (res) {
            animate = true
          }
        }
      }
    }
    if (sfl && sfl[1] !== undefined) {
      for (let j = i + 1; j < nodes.length; j++) {
        let eNode = nodes[j]
        let efl = eNode.attr('forceLink')
        if (efl && efl[1] !== undefined) {
          let hasPull = false
          for (let m = 0; m < links.length; m++) {
            //两个node之间有link，则才可能会有引力
            let { startId, endId } = links[m].attr()
            if (startId === sNode.attr('id') && endId === eNode.attr('id')) {
              hasPull = true
              break
            } else if (endId === sNode.attr('id') && startId === eNode.attr('id')) {
              hasPull = true
              break
            }
          }
          if (hasPull) {
            //引力
            let res = pullNode(sNode, eNode, sfl, efl)
            if (res) {
              animate = true
            }
          }
        }
      }
    }
  }
  if (!animate) {
    //如果没有动画在执行，tick函数清空
    this.tick.clear()
  }
}
function pullNode(sNode, eNode, sfl, efl) {
  let dis1 = sNode.forceDistance
  let dis2 = eNode.forceDistance
  let pos1 = sNode.container.attr('pos')
  let pos2 = eNode.container.attr('pos')
  let currentDis = getDistansceByPoints(pos1, pos2)
  let targetDis = dis1 * sfl[1] + dis2 * efl[1]
  //判断是否有动画
  let res = false
  if (currentDis === 0) {
    //如果距离为0，随机一个距离
    let pos = [pos1[0] + Math.random() - 0.5, pos1[1] + Math.random() - 0.5]
    sNode.container.attr({ pos: pos })
  } else if (currentDis > targetDis + 1) {
    let diffDis = Math.abs(currentDis - targetDis)
    // 如果目标距离比当前距离大，则两个node需要被弹开
    if (sNode.__dragging || eNode.__dragging) {
      //如果有node被dragging
      let moveNode = sNode
      let sPos = pos1
      let ePos = pos2
      if (sNode.__dragging) {
        moveNode = eNode
        sPos = pos2
        ePos = pos1
      }
      let point = getPointByDistance(sPos, ePos, diffDis / 2)
      moveNode.container.attr({ pos: point })
      moveNode.dispatchEvent('updatePos', {})
      res = true
    } else {
      let move1 = (diffDis * dis1 * sfl[1]) / targetDis
      let move2 = (diffDis * dis2 * efl[1]) / targetDis
      if (Math.abs(move1) > 1) {
        let point1 = getPointByDistance(pos1, pos2, move1 / 2) // 缓动，每次移动目标距离的一半
        sNode.container.attr({ pos: point1 })
        sNode.dispatchEvent('updatePos', {})
        res = true
      }
      if (Math.abs(move2) > 1) {
        let point2 = getPointByDistance(pos2, pos1, move2 / 2)
        eNode.container.attr({ pos: point2 })
        eNode.dispatchEvent('updatePos', {})
        res = true
      }
    }
  }
  return res
}
function pushNode(sNode, eNode, sfl, efl) {
  //node 力的处理 开始节点，结束节点，开始的forceLink，结束节点的forceLink
  let dis1 = sNode.forceDistance
  let dis2 = eNode.forceDistance
  let pos1 = sNode.container.attr('pos')
  let pos2 = eNode.container.attr('pos')
  let currentDis = getDistansceByPoints(pos1, pos2)
  let res = false
  //弹力的处理分支
  let targetDis = dis1 * sfl[0] + dis2 * efl[0]
  if (currentDis === 0) {
    //如果距离为0，随机一个距离
    pos2 = [pos1[0] + Math.random() - 0.5, pos1[1] + Math.random() - 0.5]
    eNode.container.attr({ pos: pos2 })
  } else if (currentDis < targetDis + 1) {
    let diffDis = Math.abs(currentDis - targetDis)
    // 如果目标距离比当前距离大，则两个node需要被弹开
    if (sNode.__dragging || eNode.__dragging) {
      //如果有node被dragging
      let moveNode = sNode
      let sPos = pos1
      let ePos = pos2
      if (sNode.__dragging) {
        moveNode = eNode
        sPos = pos2
        ePos = pos1
      }
      let point = getPointByDistance(sPos, ePos, -diffDis / 2)
      moveNode.container.attr({ pos: point })
      moveNode.dispatchEvent('updatePos', {})
      res = true
    } else {
      let move1 = (diffDis * dis1 * sfl[0]) / targetDis
      let move2 = (diffDis * dis2 * efl[0]) / targetDis
      if (Math.abs(move1) > 1) {
        let point1 = getPointByDistance(pos1, pos2, -move1 / 2) // 缓动，每次移动目标距离的一半
        sNode.container.attr({ pos: point1 })
        sNode.dispatchEvent('updatePos', {})
        res = true
      }
      if (Math.abs(move2) > 1) {
        let point2 = getPointByDistance(pos2, pos1, -move2 / 2)
        eNode.container.attr({ pos: point2 })
        eNode.dispatchEvent('updatePos', {})
        res = true
      }
    }
  }
  return res
}
function zoom(layer, group) {
  //舞台的拖动，缩放处理
  let oX, oY
  let startX, startY
  let draged = false
  layer.on('mousedown', e => {
    if (e.originalEvent.which === 3) {
      return
    }
    let $target = e.target
    if ($target === layer || $target === group) {
      oX = e.offsetX
      oY = e.offsetY
      ;[startX, startY] = group.attr('pos')
      draged = true
    }
  })
  layer.on('mousemove', e => {
    if (draged) {
      let dx = e.offsetX - oX
      let dy = e.offsetY - oY
      group.transition(0).attr({ pos: [startX + dx, startY + dy] })
    }
  })
  layer.on('mouseup', e => {
    draged = false
  })
  layer.on('mousewheel', e => {
    e.preventDefault()
    const [scaleX] = group.attr('scale')
    let [w, h] = group.attr('size')
    let direction = 1
    if (e.originalEvent.wheelDelta < 0) {
      // 向下滚动
      direction = -1
    }
    const dscale = 0.3 * direction
    /** 计算以鼠标点为中心缩放 **/
    const [oAnchorX, oAnchorY] = group.attr('anchor')
    let pX = (oAnchorX * w + e.offsetX) / w // 鼠标点相对占比
    let pY = (oAnchorY * h + e.offsetY) / h
    const [oX, oY] = group.attr('pos')
    let dx = w * dscale * pX
    let dy = h * dscale * pY
    const zoom = this.attr('zoom')
    if (scaleX + dscale > zoom[0] && scaleX + dscale < zoom[1]) {
      group.transition(0).attr({
        scale: [scaleX + dscale, scaleX + dscale],
        pos: [oX - dx, oY - dy]
      })
    }
  })
}
export default Stage

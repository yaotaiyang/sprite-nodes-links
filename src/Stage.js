import Base from './Base'
import { Scene } from 'spritejs'
import Node from './Node'
import Link from './Link'
import { getType, getDistansceByPoints, getPointByDistance, extendsObject } from './utils'
import Ticks from './Ticks'
import filterClone from 'filter-clone'
window.filterClone = filterClone
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
    scene.delegateEvent('contextmenu', document)
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
    this.checkForceLink(0)
    this.reSize()
  }
  checkForceLink(num) {
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
      this.tick.add(tick.bind(this, num))
    }
  }
  clear() {
    this.steps = []
    this.links = []
    this.container.clear()
  }
}
let tickNum = 0
function tick(status) {
  //tick函数
  let nodes = this.nodes
  let links = this.links
  let animation = this.animation
  let arrNodesAttr = this.nodes.map(node => {
    return { ...filterClone(node.__attrs), ...filterClone(node, ['renderBox', '__dragging', 'sizeBox', 'forceDistance']) }
  })
  let arrLinksAttr = links.map(link => link.__attrs)
  resultTick(arrNodesAttr, arrLinksAttr)
  let stop = needStop(arrNodesAttr)
  nodes.forEach(node => {
    let attr = arrNodesAttr.filter(attr => attr.id === node.__attrs.id)
    if (attr && attr.length) {
      attr = attr[0]
      node.attr({ pos: attr.pos })
    }
  })
  if (stop || tickNum > 10000) {
    this.tick.clear()
    tickNum = 0
  } else {
    tickNum++
  }
}

function resultTick(nodes, links) {
  computeTick(nodes, links)
  let stop = needStop(nodes)
  if (stop || tickNum > 300) {
    tickNum = 0
  } else {
    tickNum++
    resultTick(nodes, links)
  }
}
function needStop(nodes) {
  let stop = true
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i]
    if (node.__needMove) {
      stop = false
      node.pos = node.targetPos
      delete node.targetPos
      delete node.__needMove
    }
    let dis = getDistansceByPoints(node.pos, node.targetPos || node.pos)
    if (dis > 0) {
      node.pos = node.targetPos
      delete node.targetPos
      stop = false
    }
  }
  return stop
}
function computeTick(nodes, links) {
  for (let i = 0; i < nodes.length; i++) {
    let sNode = nodes[i]
    let startForceLink = sNode.forceLink
    if (startForceLink && startForceLink[0] !== undefined) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (j !== i) {
          let eNode = nodes[j]
          let endForceLink = eNode.forceLink
          if (endForceLink && endForceLink[0] !== undefined) {
            computePush(sNode, eNode, startForceLink, endForceLink)
          }
        }
      }
    }
    if (startForceLink && startForceLink[1] !== undefined) {
      for (let j = i + 1; j < nodes.length; j++) {
        let eNode = nodes[j]
        let endForceLink = eNode.forceLink
        if (endForceLink && endForceLink[1] !== undefined) {
          let hasPull = false //判断两点是否存在pull力
          for (let m = 0; m < links.length; m++) {
            //两个node之间有link，则才可能会有引力
            let { startId, endId } = links[m]
            if (startId === sNode.id && endId === eNode.id) {
              hasPull = true
              break
            } else if (endId === sNode.id && startId === eNode.id) {
              hasPull = true
              break
            }
          }
          hasPull && computePull(sNode, eNode, startForceLink, endForceLink)
        }
      }
    }
  }
}
function computePull(sNode, eNode, startForceLink, endForceLink) {
  let dis1 = sNode.forceDistance
  let dis2 = eNode.forceDistance
  let pos1 = sNode.pos
  let pos2 = eNode.pos
  let currentDis = getDistansceByPoints(pos1, pos2)
  let targetDis = dis1 * startForceLink[1] + dis2 * startForceLink[1]
  //判断是否有动画
  if (currentDis === 0 && sNode.fixed !== true) {
    //如果距离为0，随机一个距离
    let pos = [pos1[0] + getRandomDis(), pos1[1] + getRandomDis()]
    sNode.targetPos = pos
    sNode.__needMove = true
  } else if (currentDis > targetDis + 1) {
    return computeMove(sNode, eNode, currentDis, targetDis)
  }
}
function computePush(sNode, eNode, startForceLink, endForceLink) {
  let dis1 = sNode.forceDistance
  let dis2 = eNode.forceDistance
  let pos1 = sNode.pos
  let pos2 = eNode.pos
  let currentDis = getDistansceByPoints(pos1, pos2)
  let targetDis = dis1 * startForceLink[0] + dis2 * endForceLink[0]
  if (currentDis === 0) {
    pos2 = [pos1[0] + getRandomDis(), pos1[1] + getRandomDis()]
    eNode.targetPos = pos2
  } else if (currentDis < targetDis + 0.1) {
    return computeMove(sNode, eNode, currentDis, targetDis)
  }
}
function getRandomDis() {
  return Math.random() - 0.5
}
function computeMove(sNode, eNode, currentDis, targetDis) {
  let pos1 = sNode.pos
  let pos2 = eNode.pos
  let weight1 = sNode.weight
  let weight2 = eNode.weight
  let diffDis = currentDis - targetDis
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
    setPos(moveNode, sPos, ePos, diffDis)
  } else {
    let move1 = (diffDis * weight1) / (weight1 + weight2)
    let move2 = (diffDis * weight2) / (weight1 + weight2)
    setPos(sNode, pos1, pos2, move1)
    setPos(eNode, pos2, pos1, move2)
  }
}
function setPos(node, pos1, pos2, move) {
  if (!node.fixed) {
    let point = getPointByDistance(pos1, pos2, move / 2)
    let forceAxis = node.forceAxis
    if (forceAxis === 'y') {
      point[0] = node.pos[0]
    } else if (forceAxis === 'x') {
      point[1] = node.attr.pos[1]
    }
    node.targetPos = point
  }
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
    //if ($target === layer || $target === group) {
    oX = e.offsetX
    oY = e.offsetY
    ;[startX, startY] = group.attr('pos')
    draged = true
    //}
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

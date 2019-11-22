import Base from './Base'
import { Scene } from 'spritejs'
import Node from './Node'
import Link from './Link'
import { getType, getDistansceByPoints, getPointByDistance, extendsObject } from './utils'
import Ticks from './Ticks'
import filterClone from 'filter-clone'
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
  let nodesAttr = this.nodes.map(node => {
    return { ...filterClone(node.__attrs), ...filterClone(node, ['renderBox', '__dragging', 'sizeBox', 'forceDistance']) }
  })
  let linksAttr = links.map(link => link.__attrs)
  let animate = computeForce(nodesAttr, linksAttr)
  nodes.forEach(node => {
    let attr = nodesAttr.filter(attr => attr.id === node.__attrs.id)
    if (attr && attr.length) {
      attr = node.attr({ pos: attr[0].pos })
    }
  })
  //let animate = false
  // for (let i = 0; i < nodes.length; i++) {
  //   let sNode = nodes[i]
  //   let startForceLink = sNode.attr('forceLink')
  //   if (startForceLink && startForceLink[0] !== undefined) {
  //     for (let j = i + 1; j < nodes.length; j++) {
  //       let eNode = nodes[j]
  //       let endForceLink = eNode.attr('forceLink')
  //       if (endForceLink && endForceLink[0] !== undefined) {
  //         let res = pushNode(sNode, eNode, startForceLink, endForceLink)
  //         if (res) {
  //           animate = true
  //         }
  //       }
  //     }
  //   }
  //   if (startForceLink && startForceLink[1] !== undefined) {
  //     for (let j = i + 1; j < nodes.length; j++) {
  //       let eNode = nodes[j]
  //       let endForceLink = eNode.attr('forceLink')
  //       if (endForceLink && endForceLink[1] !== undefined) {
  //         let hasPull = false
  //         for (let m = 0; m < links.length; m++) {
  //           //两个node之间有link，则才可能会有引力
  //           let { startId, endId } = links[m].attr()
  //           if (startId === sNode.attr('id') && endId === eNode.attr('id')) {
  //             hasPull = true
  //             break
  //           } else if (endId === sNode.attr('id') && startId === eNode.attr('id')) {
  //             hasPull = true
  //             break
  //           }
  //         }
  //         if (hasPull) {
  //           //引力
  //           let res = pullNode(sNode, eNode, startForceLink, endForceLink)
  //           if (res) {
  //             animate = true
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
  if (!animate) {
    //如果没有动画在执行，tick函数清空
    console.log()
    this.dispatchEvent('animateComplete', extendsObject(null))
    this.tick.clear()
  }
}
function computeForce(nodes, links) {
  let animate = false
  for (let i = 0; i < nodes.length; i++) {
    let sNode = nodes[i]
    let startForceLink = sNode.forceLink
    if (startForceLink && startForceLink[0] !== undefined) {
      for (let j = i + 1; j < nodes.length; j++) {
        let eNode = nodes[j]
        let endForceLink = eNode.forceLink
        if (endForceLink && endForceLink[0] !== undefined) {
          let res = computePush(sNode, eNode, startForceLink, endForceLink)
          if (res) {
            animate = true
          }
        }
      }
    }
    if (startForceLink && startForceLink[1] !== undefined) {
      for (let j = i + 1; j < nodes.length; j++) {
        let eNode = nodes[j]
        let endForceLink = eNode.forceLink
        if (endForceLink && endForceLink[1] !== undefined) {
          let hasPull = false
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
          if (hasPull) {
            //引力
            let res = computePull(sNode, eNode, startForceLink, endForceLink)
            if (res) {
              animate = true
            }
          }
        }
      }
    }
  }
  return animate
}
function computePull(sNode, eNode, startForceLink, endForceLink) {
  let { forceDistance: dis1, pos: pos1 } = sNode
  let { forceDistance: dis2, pos: pos2 } = eNode
  let currentDis = getDistansceByPoints(pos1, pos2)
  let targetDis = dis1 * startForceLink[1] + dis2 * endForceLink[1]
  //判断是否有动画
  if (currentDis === 0) {
    //如果距离为0，随机一个距离
    let pos = [pos1[0] + Math.random() - 0.5, pos1[1] + Math.random() - 0.5]
    sNode.pos = pos
  } else if (currentDis > targetDis + 1) {
    return computeMove(sNode, eNode, currentDis, targetDis)
  }
}
function computePush(sNode, eNode, startForceLink, endForceLink) {
  let { forceDistance: dis1, pos: pos1 } = sNode
  let { forceDistance: dis2, pos: pos2 } = eNode
  let currentDis = getDistansceByPoints(pos1, pos2)
  let targetDis = dis1 * startForceLink[1] + dis2 * endForceLink[1]
  if (currentDis === 0) {
    //如果距离为0，随机一个距离
    let pos = [pos1[0] + Math.random() - 0.5, pos1[1] + Math.random() - 0.5]
    sNode.pos = pos
  } else if (currentDis < targetDis + 1) {
    return computeMove(sNode, eNode, currentDis, targetDis)
  }
}
function computeMove(sNode, eNode, currentDis, targetDis) {
  let res = false
  let { pos: pos1, weight: weight1 } = sNode
  let { pos: pos2, weight: weight2 } = eNode
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
    let move = computePos(moveNode, sPos, ePos, diffDis)
    if (move) {
      res = move
    }
  } else {
    let move1 = (diffDis * weight1) / (weight1 + weight2)
    let move2 = (diffDis * weight2) / (weight1 + weight2)
    if (Math.abs(move1) > 1) {
      let move = computePos(sNode, pos1, pos2, move1)
      if (move) {
        res = true
      }
    }
    if (Math.abs(move2) > 1) {
      let move = computePos(eNode, pos2, pos1, move2)
      if (move) {
        res = move
      }
    }
  }
  return res
}
function computePos(node, pos1, pos2, move) {
  if (!node.fixed) {
    let point = getPointByDistance(pos1, pos2, move / 2)
    let forceAxis = node.forceAxis
    if (forceAxis === 'y') {
      point[0] = node.pos[0]
    } else if (forceAxis === 'x') {
      point[1] = node.pos[1]
    }
    node.pos = point
    return true
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

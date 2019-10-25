import Base from './Base'
import { Scene } from 'spritejs'
import Node from './Node'
import Link from './Link'
import { getType } from './utils'
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
    this.containers = [this.container]
    this.layers = Object.create(null)
    this.layers['default'] = scene.layer('default')
    scene.delegateEvent('mousewheel', document)
    this.layers.default.append(this.container)
    if (this.attr('zoom') !== false) {
      zoom.call(this, this.layers.default, this.container)
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
        if (cStartId === startId && CEndId === endStepId) {
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
  }
  clear() {
    this.steps = []
    this.links = []
    this.container.clear()
  }
}
function zoom(canvas, group) {
  let oX, oY
  let startX, startY
  let draged = false
  canvas.on('mousedown', e => {
    if (e.originalEvent.which === 3) {
      return
    }
    let $target = e.target
    if ($target === canvas || $target === group) {
      oX = e.offsetX
      oY = e.offsetY
      ;[startX, startY] = group.attr('pos')
      draged = true
    }
  })
  canvas.on('mousemove', e => {
    if (draged) {
      let dx = e.offsetX - oX
      let dy = e.offsetY - oY
      group.transition(0).attr({ pos: [startX + dx, startY + dy] })
    }
  })
  canvas.on('mouseup', e => {
    draged = false
  })
  canvas.on('mousewheel', e => {
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

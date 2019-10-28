import Base from './Base'
import { Label } from 'spritejs'
import { guid } from './utils'

class Node extends Base {
  constructor(attrs) {
    super(attrs)
    let defaultAttrs = {
      pos: [0, 0],
      forceLink: [1, 2] //renderBox对角线的一半为基础，最小值与最大值
    }
    let thisAttrs = Object.assign(defaultAttrs, attrs)
    this.attr(thisAttrs)
    let { id, draggable: attrDrag } = thisAttrs
    if (!id) {
      this.attr('id', guid())
    }
    if (attrDrag !== false) {
      this.draggable()
    }
    let { pos } = thisAttrs
    this.container.attr({ pos, zIndex: 100 })
    this.on('drag', e => {
      this.dispatchEvent('updatePos', {})
      this.__dragging = true
      this.stage.checkForceLink()
    })
    this.on('dragstart', e => {
      this.container.attr({ zIndex: 110 })
    })
    this.on('dragend', e => {
      this.stage.nodes.forEach(node => {
        if (node === this) {
          this.container.attr({ zIndex: 101 })
        } else {
          node.container.attr({ zIndex: 100 })
        }
      })
      this.__dragging = false
    })
    this.on('updatePos', e => {
      let myId = this.attr('id')
      this.stage.links.forEach(link => {
        let { startId, endId } = link.attr()
        if (startId === myId || endId === myId) {
          link.move()
        }
      })
    })
  }
  draw() {
    let txt = this.attr('text') || 'node'
    let label = new Label(txt)
    label.attr({
      border: { color: '#ccc', width: 1, style: 'solid' },
      padding: [2, 6],
      bgcolor: '#fff',
      borderRadius: [5],
      anchor: [0.5]
    })
    this.append(label)
  }
  mounted() {
    super.mounted()
    let [xMin, yMin, xMax, yMax] = this.sizeBox
    this.forceDistance = Math.sqrt((xMax - xMin) ** 2 + (yMax - yMin) ** 2) / 2
  }
  remove() {
    let myStage = this.stage
    let nodes = myStage.nodes
    let nodeId = ''
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] === this) {
        myStage.container.removeChild(nodes[i].container)
        nodeId = nodes[i].attr('id')
        nodes.splice(i, 1)
      }
    }
    if (nodeId) {
      myStage.links.forEach(link => {
        let { startId, endId } = link.attr()
        if (nodeId === startId || nodeId === endId) {
          link.remove()
        }
      })
    }
  }
}
export default Node

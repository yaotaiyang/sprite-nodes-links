import Base from './Base'
import { Label } from 'spritejs'
import { guid, getType } from './utils'

class Node extends Base {
  constructor(attrs) {
    super(attrs)
    let defaultAttrs = {
      text: 'node',
      pos: [0, 0],
      weight: 1, //权重，权重越大引力产生影响越小
      fixed: false, //是否固定位置不受力的影响
      forceLink: [1, 2], //renderBox对角线的一半为基础，最小值与最大值
      forceAxis: '' //force生效坐标轴，可以为x，y
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
    this.addEventListener('drag', e => {
      this.__dragging = true
      this.attr('pos', this.container.attr('pos'))
      this.stage.checkForceLink(true)
    })
    this.addEventListener('dragstart', e => {
      this.container.attr({ zIndex: 110 })
    })
    this.addEventListener('dragend', e => {
      this.stage.nodes.forEach(node => {
        if (node === this) {
          this.container.attr({ zIndex: 101 })
        } else {
          node.container.attr({ zIndex: 100 })
        }
      })
      this.__dragging = false
      this.stage.checkForceLink(true)
    })
  }
  moveLink() {
    let myId = this.attr('id')
    if (this.stage && this.stage.links) {
      this.stage.links.forEach(link => {
        let { startId, endId } = link.attr()
        if (startId === myId || endId === myId) {
          link.move()
        }
      })
    }
  }
  attr(name, value) {
    let res = super.attr(name, value)
    if (getType(name) === 'object') {
      for (let key in name) {
        if (key === 'pos' && this.container) {
          this.container.attr(key, name[key])
          this.moveLink()
        }
      }
    } else if (name === 'pos' && this.container) {
      this.container.attr(name, value)
      this.moveLink()
    }
    return res
  }
  draw() {
    let txt = this.attr('text')
    let label = new Label(txt)
    label.attr({
      border: [1, '#ccc'],
      fontFamily: 'Arial',
      fontSize: 14,
      padding: [2, 6],
      bgcolor: '#fff',
      borderRadius: [5],
      anchor: [0.5]
    })
    this.$label = label
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

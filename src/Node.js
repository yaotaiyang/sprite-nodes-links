import Base from './Base'
import { Label } from 'spritejs'
import { guid } from './utils'

class Node extends Base {
  constructor(attrs) {
    super(attrs)
    let defaultAttrs = {
      selector: '',
      size: [600, 400],
      zoom: [0.5, 2]
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
  }
  draw() {
    let txt = this.attr('text') || 'node'
    let label = new Label(txt)
    label.attr({
      border: { color: '#ccc', width: 1, style: 'solid' },
      padding: [2, 6],
      bgcolor: '#fff',
      borderRadius: [5]
    })
    this.append(label)
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

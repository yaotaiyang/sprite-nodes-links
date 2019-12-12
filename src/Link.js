import Base from './Base'
import { Polyline } from 'spritejs'
class Link extends Base {
  constructor(attrs) {
    super(attrs)
    this.attr(attrs)
    this.$line = null
  }
  draw() {
    this.$line = new Polyline()
    this.append(this.$line)
    this.move()
  }
  move() {
    let { startId, endId } = this.attr()
    let startNode = this.stage.nodes.filter(node => node.attr('id') === startId)
    let endNode = this.stage.nodes.filter(node => node.attr('id') === endId)
    if (startNode && endNode) {
      startNode = startNode[0]
      endNode = endNode[0]
      let startPoint = startNode.container.attr('pos')
      let endPoint = endNode.container.attr('pos')
      if (this.$line) {
        this.$line.attr({ points: [startPoint, endPoint] })
      }
    }
  }
  remove() {
    let myStage = this.stage
    let links = myStage.links
    for (let i = 0; i < links.length; i++) {
      if (links[i] === this) {
        myStage.container.removeChild(links[i].container)
        links.splice(i, 1)
      }
    }
  }
}
export default Link

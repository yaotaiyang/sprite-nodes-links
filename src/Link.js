import Base from './Base'
class Link extends Base {
  constructor(attrs) {
    super(attrs)
  }
  draw() {
    let { startId, endId } = this.attr()
    console.log(startId, endId)
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

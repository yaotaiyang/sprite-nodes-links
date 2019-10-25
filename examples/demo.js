import { Node, Stage, Link } from '../src/index'
let stage = new Stage({
  selector: '#app'
})
let node1 = new Node()
let node2 = new Node()
let link = new Link({ startId: node1.attr('id'), endId: node2.attr('id') })
stage.append([node1, node2, link])
console.log(stage)

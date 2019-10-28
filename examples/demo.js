import { Node, Stage, Link } from '../src/index'
let stage = new Stage({
  selector: '#app'
})
let node1 = new Node({ pos: [200, 200] })
let node2 = new Node({ pos: [200, 200] })
let node3 = new Node({ pos: [200, 200] })
let node4 = new Node({ pos: [200, 200] })
let link1 = new Link({ startId: node1.attr('id'), endId: node2.attr('id') })
let link2 = new Link({ startId: node2.attr('id'), endId: node3.attr('id') })
let link3 = new Link({ startId: node3.attr('id'), endId: node4.attr('id') })
stage.append([node1, node2, node3, node4, link1, link2, link3])

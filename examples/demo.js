import { Node, Stage, Link } from '../src/index'
let stage = new Stage({
  selector: '#app',
  forceLink: true,
  layout: '' // ['','layered'] 分层布局
})
let node1 = new Node({ pos: [200, 200], fixed: true, text: '不受力固定点' })
let node2 = new Node({ pos: [200, 200], text: 'y轴受力', forceAxis: 'y' })
let node3 = new Node({ pos: [200, 200], text: '自由节点' })
let node4 = new Node({ pos: [200, 200], text: '自由节点' })
let link1 = new Link({ startId: node1.attr('id'), endId: node2.attr('id') })
let link2 = new Link({ startId: node2.attr('id'), endId: node3.attr('id') })
let link3 = new Link({ startId: node3.attr('id'), endId: node4.attr('id') })
//stage.append([node1, node2, node3, node4, link1, link2, link3])
stage.append([link1, node1, node2])
stage.checkForceLink(false)
window.stage = stage
console.log(stage)

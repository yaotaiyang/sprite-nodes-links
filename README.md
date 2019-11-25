# sprite-nodes-links

基于 spritejs 的节点链接基础库

```
let stage = new Stage({
  selector: '#app',
  animation: false //开始渲染是否启用动画
})

let node1 = new Node({
  pos: [200, 200], //布局的位置
  fixed: true, //自由布局的时候是否固定，不受其它节点力的影响
  text: '不受力固定点',
  //weight:1,//该节点的引力权重，该值越大，产生力时效果越明显，默认值都为1
  //forceLink:[1,2], //引力的范围最小值和最大值，即当距离小于数组第一位的时候产生推力，当距离小于第二位时产生拉力，默认值为[1,2]
  //forceAxis:'y' //是否锁定为x轴或者y轴受力
  })
let node2 = new Node({ pos: [200, 200], text: 'y轴受力', forceAxis: 'y' })
let node3 = new Node({ pos: [200, 200], text: '自由节点' })
let node4 = new Node({ pos: [200, 200], text: '自由节点' })
let link1 = new Link({
  startId: node1.attr('id'), //开始节点的id
  endId: node2.attr('id') //结束节点的id
})
let link2 = new Link({ startId: node2.attr('id'), endId: node3.attr('id') })
let link3 = new Link({ startId: node3.attr('id'), endId: node4.attr('id') })
stage.append([node1, node2, node3, node4, link1, link2, link3])
```

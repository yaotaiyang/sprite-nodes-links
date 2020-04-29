import { Group, Node } from 'spritejs'
import { getType } from './utils'
import { draggable } from 'next-draggable'
import filterClone from 'filter-clone'
Node.prototype.clear = function () {
  for (let i = 0; i < this.children.length; i++) {
    this.children[i].remove()
    i--
  }
}
class Base extends Node {
  constructor(attrs) {
    super()
    this.attr(attrs)
    this.sizeBox = [0, 0, 0, 0] // 尺寸内部大小
    this.renderBox = [0, 0, 0, 0] // 坐标大小
    this.__attrs = filterClone(null)
    this.__isDragging = false
    this.container = new Group()
    this.container.attr({ size: [0.1, 0.1] }) // 将group设置成非常小，不影响其他dom，并且不clip内部元素
    this.addEventListener('mounted', this.mounted)
    // 拖动的时候，修改renderBox
    this.addEventListener('drag', () => {
      const [oX, oY] = this.container.attr('pos')
      this.renderBox = [oX + this.sizeBox[0], oY + this.sizeBox[1], oX + this.sizeBox[2], oY + this.sizeBox[3]]
    })
  }
  addEventListener(type, func) {
    super.addEventListener(type, func)
    let eventList = ['click', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'contextmenu', 'dragstart', 'drag', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop']
    if (eventList.indexOf(type) !== -1) {
      this.container.addEventListener(type, (...args) => {
        if (type === 'drag') {
          this.__isDragging = true
        } else if (type === 'dragend') {
          setTimeout(_ => {
            this.__isDragging = false
          })
        }
        if (this.__isDragging && type === 'click') {
          //dragging的时候，click事件不触发
        } else {
          func(...args)
        }
      })
    }
  }
  pointCollision() {
    return true
  }
  append(sprites) {
    if (getType(sprites) === 'array') {
      sprites.forEach(sprite => {
        this.container.append(sprite)
      })
    } else {
      this.container.append(sprites)
    }
  }
  /* 保持与spritejs 接口统一,拦截Node attr */
  attr(name, value) {
    if (name === undefined && value === undefined) {
      // 获取全部属性 this.attr()
      return this.__attrs
    } else if (value === undefined && getType(name) === 'string') {
      // 获取属性 this.attr('color')
      return this.__attrs[name]
    } else if (getType(name) === 'object') {
      // 对象属性赋值 this.attr({'color':'#f00'})
      this.__attrs = Object.assign(filterClone(this.__attrs || {}), name)
    } else if (getType(name) === 'string' && value !== undefined) {
      // 单一对象赋值 this.attr('color','#f00')
      this.__attrs[name] = value
    }
  }
  draggable(option) {
    draggable(this.container, option)
  }
  remove() {
    console.error('you must overwrite this function remove()')
  }
  render() {
    this.container.clear()
    this.draw()
    return this.container
  }
  draw() {
    console.error('you must overwrite this function draw()')
  }
  mounted() {
    this.reSize()
  }
  reSize() {
    let container = this.container
    let [xMin, yMin, xMax, yMax] = [0, 0, 0, 0]
    if (container.layer) {
      //取最大值来进行比较
      let { width, height } = container.layer.getResolution()
      xMin = width / container.layer.displayRatio
      yMin = height / container.layer.displayRatio
    }
    let [oX, oY] = this.container.attr('pos')
    if (container.children.length > 0) {
      container.children.forEach(sprite => {
        if (sprite.attr('layout') !== false && sprite.mesh) {
          //如果layout为false 不参数计算布局
          const [left, top, width, height] = sprite.originalClientRect
          xMin = Math.min(xMin, left)
          yMin = Math.min(yMin, top)
          xMax = Math.max(xMax, left + width)
          yMax = Math.max(yMax, top + height)
        }
      })
    }
    this.sizeBox = [xMin, yMin, xMax, yMax]
    this.renderBox = [oX + xMin, oY + yMin, oX + xMax, oY + yMax]
  }
}
export default Base

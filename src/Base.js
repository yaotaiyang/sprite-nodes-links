import { Group, BaseNode } from 'spritejs'
import { getType, extendsObject } from './utils'
import { draggable } from 'sprite-draggable'
class Base extends BaseNode {
  constructor(attrs) {
    super()
    this.attr(attrs)
    this.sizeBox = [0, 0, 0, 0] // 尺寸内部大小
    this.renderBox = [0, 0, 0, 0] // 坐标大小
    this.__attrs = extendsObject(null)
    this.container = new Group()
    this.container.attr({ size: [0.1, 0.1], clipOverflow: false }) // 将group设置成非常小，不影响其他dom，并且不clip内部元素
    ;['dragstart', 'drag', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop', 'click', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'contextmenu'].forEach(evt => {
      // 透传container上的事件
      this.container.on(evt, e => {
        this.dispatchEvent(evt, e)
      })
    })
    this.on('mounted', this.mounted)
    // 拖动的时候，修改renderBox
    this.on('drag', () => {
      const [oX, oY] = this.container.renderBox
      this.renderBox = [oX + this.sizeBox[0], oY + this.sizeBox[1], oX + this.sizeBox[2], oY + this.sizeBox[3]]
    })
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
  /* 保持与spritejs 接口统一,拦截BaseNode attr */
  attr(name, value) {
    let oldAttr = extendsObject({}, this.__attrs)
    if (name === undefined && value === undefined) {
      // 获取全部属性 this.attr()
      return this.__attrs
    } else if (value === undefined && getType(name) === 'string') {
      // 获取属性 this.attr('color')
      return this.__attrs[name]
    } else if (getType(name) === 'object') {
      // 对象属性赋值 this.attr({'color':'#f00'})
      this.__attrs = extendsObject(this.__attrs, name)
      this.attrUpdate(extendsObject(name), oldAttr)
    } else if (getType(name) === 'string' && value !== undefined) {
      // 单一对象赋值 this.attr('color','#f00')
      this.__attrs[name] = value
      this.attrUpdate(extendsObject({ [name]: value }), oldAttr)
    }
    if (name === 'pos') {
      this.container.attr(name, value)
    }
  }
  attrUpdate(newAttrs, oldAttrs) {}
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
    let [xMin, yMin, xMax, yMax] = this.sizeBox
    this.renderBox = container.renderBox
    let [oX, oY] = this.renderBox
    if (container.children.length > 0) {
      container.children.forEach(sprite => {
        const renderBox = sprite.renderBox
        xMin = Math.min(xMin, renderBox[0])
        yMin = Math.min(yMin, renderBox[1])
        xMax = Math.max(xMax, renderBox[2])
        yMax = Math.max(yMax, renderBox[3])
      })
    }
    this.sizeBox = [xMin, yMin, xMax, yMax]
    this.renderBox = [oX + xMin, oY + yMin, oX + xMax, oY + yMax]
  }
}
export default Base

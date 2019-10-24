import { Group, BaseNode } from 'spritejs'

class Base extends BaseNode {
  constructor(attrs) {
    super(attrs)
    this.$group = new Group()
  }
  pointCollision() {
    return true
  }
  attr() {}
  append() {}
  mounted() {}
}
export default Base
